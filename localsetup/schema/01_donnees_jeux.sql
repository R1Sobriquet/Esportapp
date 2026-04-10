-- ============================================================
-- GameConnect — Catalogue des jeux (données de référence)
-- Usage : mysql -u root -p esport_social < localsetup/schema/01_donnees_jeux.sql
-- ============================================================

USE esport_social;

INSERT INTO games (name, category, icon_url, api_id) VALUES
('Valorant',            'FPS',             'https://cdn.jsdelivr.net/gh/xNocken/valorant-api-assets/agents/icons/displayicon.png',             'valorant'),
('League of Legends',   'MOBA',            'https://cdn.iconscout.com/icon/free/png-256/league-of-legends-2-569244.png',                        'lol'),
('Counter-Strike 2',    'FPS',             'https://cdn.akamai.steamstatic.com/apps/csgo/images/csgo_react//cs2/CS2_logo.svg',                  'cs2'),
('Overwatch 2',         'FPS',             'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Overwatch_circle_logo.svg/1200px-Overwatch_circle_logo.svg.png', 'ow2'),
('Rocket League',       'Sports',          'https://cdn2.steamgriddb.com/file/sgdb-cdn/icon/d0b6b6e1e55f31a47e088e1e98a59a3b.png',              'rocket-league'),
('Dota 2',              'MOBA',            'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/logos/dota2_logo.png',           'dota2'),
('Apex Legends',        'Battle Royale',   'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Apex_legends_logo.svg/1200px-Apex_legends_logo.svg.png', 'apex'),
('Fortnite',            'Battle Royale',   'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Fortnite_logo.svg/1200px-Fortnite_logo.svg.png', 'fortnite'),
('Rainbow Six Siege',   'FPS',             'https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/449BBgnc3Q1ha2IN9rh3bR/e1fce39cfe3470fd49c36a4938c6b7d0/r6s-logo.png', 'r6s'),
('Call of Duty: Warzone', 'Battle Royale', 'https://www.callofduty.com/content/dam/atvi/callofduty/cod-touchui/warzone/common/social-share/social-share-image.jpg', 'cod-warzone'),
('Minecraft',           'Sandbox',         'https://upload.wikimedia.org/wikipedia/en/5/51/Minecraft_cover.png',                                 'minecraft'),
('FIFA 24',             'Sports',          'https://cdn.sofifa.net/meta/fifa24.png',                                                             'fifa24'),
('Street Fighter 6',    'Fighting',        'https://www.streetfighter.com/6/assets/images/common/logo.png',                                     'sf6'),
('Tekken 8',            'Fighting',        'https://cdn.bandainamcoent.eu/production/tekken-8-logo-1696863865097.png',                           'tekken8'),
('World of Warcraft',   'MMORPG',          'https://upload.wikimedia.org/wikipedia/en/9/91/WoW_icon.png',                                        'wow'),
('Final Fantasy XIV',   'MMORPG',          'https://img.finalfantasyxiv.com/lds/h/i/cR5q5k6kfHvRJ0lP8uDqfKxMfU.png',                           'ffxiv'),
('Genshin Impact',      'Action RPG',      'https://upload.wikimedia.org/wikipedia/en/5/5e/Genshin_Impact_logo.svg',                             'genshin'),
('Among Us',            'Social Deduction','https://www.innersloth.com/wp-content/uploads/2023/10/AU_Logo-300x300.png',                          'among-us'),
('Fall Guys',           'Battle Royale',   'https://cdn2.steamgriddb.com/file/sgdb-cdn/icon/5a08e49c3a8cc3fa7b90c93a9a9b0e39.png',              'fall-guys'),
('Halo Infinite',       'FPS',             'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Halo_Infinite_logo.svg/2560px-Halo_Infinite_logo.svg.png', 'halo-infinite');

-- Vérification
SELECT id, name, category FROM games ORDER BY category, name;
