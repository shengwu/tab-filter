import json
from bs4 import BeautifulSoup, Tag

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
    # TODO
    pass

def process_play_links(links):
    pass

def process_row(row):
    '''Processes the information for a single tab.

    Args:
      row: a bs4 Tag object from banjo hangout

    Returns:
      a dictionary containing information about a tab'''
    title = row.find_all('a')[0].string
    meta = process_meta(row.find_all('span')[0].string)
    download_links = process_download_links(row.find_all('span')[2])
    play_links = process_play_links(row.find_all('span')[2])
    data = {
        'title': title,
        'meta': meta,
    }

    # Optional attributes
    if len(row.find_all('i')) > 0:
        data['desc'] = desc = row.find_all('i')[0].string
    return data

def main():
    soup = BeautifulSoup(open('all_tabs_table_20170503.html'), 'html.parser')
    tab_table = soup.contents[0].contents[1].contents
    tabs = []
    for row in tab_table:
        if is_valid_row(row):
            tabs.append(process_row(row))
    with open('tabs.json', 'w+') as f:
        json.dump(tabs, f, indent=4)

if __name__ == '__main__':
    main()
