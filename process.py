import json
from bleach.linkifier import Linker
from bs4 import BeautifulSoup, Tag
from collections import defaultdict
from datetime import datetime
from urlparse import urlparse


VALID_DOWNLOAD_FORMATS = [
    'TABLEDIT',
    'TABRITE',
    'TEXT',
    'PDF',
    'GIF',
    'JPEG',
    'GUITAR-PRO',
]

SPECIAL_LINK_BEGIN = 'Download from '


def is_valid_row(row):
    return type(row) is Tag and len(row.find_all('a')) > 0


def meta_attribute(pair):
    halves = pair.split(':')
    key = halves[0].strip()
    value = halves[1].strip()
    if key == 'Genre':
        return ('genre', value)
    if key == 'Style':
        return ('style', value)
    if key == 'Key':
        return ('key', value)
    if key == 'Tuning':
        return ('tuning', value)
    if key == 'Difficulty':
        return ('difficulty', value)


def process_meta(meta):
    if meta is None:
        return {}
    parts = meta.strip().split(u'\xa0\xa0')
    # Accomodate partial lists of attributes
    return dict(meta_attribute(part) for part in parts)


def process_download_links(links):
    # Either the first child is 'DOWNLOAD:' or a special link
    first = links.contents[0]
    if first.string.startswith(SPECIAL_LINK_BEGIN):
        assert type(first) is Tag
        assert first.name == 'a'
        external_site = first.string[len(SPECIAL_LINK_BEGIN):]
        return {
            external_site: [first['href']],
        }
    if 'DOWNLOAD' not in first:
        return

    # Process the list of links
    i = 1
    result = defaultdict(list)
    while i < len(links.contents):
        curr = links.contents[i]
        if type(curr) is Tag and curr.name == 'a'\
                and curr.string in VALID_DOWNLOAD_FORMATS:
            download_type = curr.string.lower()
            download_link = curr['href']
            result[download_type].append(download_link)
        i += 1
    return result


def process_play_links(links):
    result = {}

    # assume multiple play links are duplicates
    # mp3 links
    i = 0
    while i < len(links.contents) and 'MP3' not in links.contents[i]:
        i += 1
    if i != len(links.contents):
        i += 3
        curr = links.contents[i]
        assert type(curr) is Tag
        assert curr.name == 'a'
        result['mp3'] = curr['href']

    # midi links
    i = 0
    while i < len(links.contents) and 'MIDI' not in links.contents[i]:
        i += 1
    if i != len(links.contents):
        i += 3
        curr = links.contents[i]
        assert type(curr) is Tag
        assert curr.name == 'a'
        result['midi'] = curr['href']

    return result


def process_posted_by(row):
    '''Returns the user who posted a tab'''
    return row.find_all('span')[1].find_all('a')[0].string


def process_last_updated(row):
    '''Returns the last updated timestamp for a tab'''
    time_parts = row.find_all('span')[1].contents[2].split()[-3:]
    orig_time = ' '.join(time_parts)
    return datetime.strptime(orig_time, '%m/%d/%Y %I:%M %p').isoformat()


def process_row(row, linker):
    '''Processes the information for a single tab.

    Args:
      row: a bs4 Tag object from banjo hangout

    Returns:
      a dictionary containing information about a tab'''

    title = row.find_all('a')[0].string
    posted_by = process_posted_by(row)
    last_updated = process_last_updated(row)
    data = {
        'title': title,
        'posted_by': posted_by,
        'last_updated': last_updated,
    }

    # Optional attributes

    if len(row.find_all('i')) > 0:
        data['desc'] = linker.linkify(row.find_all('i')[0].string)

    meta = process_meta(row.find_all('span')[0].string)
    if meta:
        data['meta'] = meta

    download_links = process_download_links(row.find_all('span')[2])
    if download_links:
        data['download'] = download_links

    play_links = process_play_links(row.find_all('span')[2])
    if play_links:
        data['play'] = play_links

    return data


def set_target(attrs, new=False):
    '''Makes the bleach linkifier create links that open in a new tab'''
    p = urlparse(attrs[(None, u'href')])
    attrs[(None, u'target')] = u'_blank'
    return attrs


HTML_FILE = 'all_tabs_table_20170503.html'
#HTML_FILE = 'sometabs.html'

def main():
    print 'Parsing HTML from {}'.format(HTML_FILE)
    soup = BeautifulSoup(open(HTML_FILE), 'html.parser')
    tab_table = soup.contents[0].contents[1].contents
    tabs = []
    linker = Linker(callbacks=[set_target])
    print 'Processing tabs'
    for i, row in enumerate(tab_table):
        if is_valid_row(row):
            tabs.append(process_row(row, linker))
        if (i + 1) % 1000 == 0:
            print '{} tabs processed'.format(i+1)
    with open('tabs.js', 'w+') as f:
        f.write('var TABS = {};'.format(json.dumps(tabs, indent=4)))

if __name__ == '__main__':
    main()
