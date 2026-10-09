from pathlib import Path
site = Path('index.html')
page = site.read_text(encoding='utf-8')
assert '</head>' in page and '</body>' in page
css = '<link rel="stylesheet" href="./assets/ios-keyboard-stability.css?v=2">'
js = '<script src="./assets/ios-keyboard-stability.js?v=2" defer></script>'
if 'ios-keyboard-stability.css' not in page:
    page = page.replace('</head>', css + '\n</head>', 1)
if 'ios-keyboard-stability.js' not in page:
    page = page.replace('</body>', js + '\n</body>', 1)
site.write_text(page, encoding='utf-8')
