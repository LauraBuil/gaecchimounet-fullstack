-- Associe chaque recette ajoutée au catalogue à sa photographie culinaire.
-- Le suffixe de version permet de remplacer une image plus tard sans que le
-- cache longue durée du navigateur conserve l'ancienne photographie.
update public.recipes
set
    image_path = '/img/recipes/' || slug || '.webp?v=1',
    image_alt = 'Photographie du plat : ' || title
where slug in (
    'risotto-petits-pois-epinards-citron',
    'salade-tiede-feves-radis-chevre-frais',
    'navets-nouveaux-glaces-miel-thym',
    'omelette-blettes-herbes-fraiches',
    'pesto-fanes-radis-amandes',
    'galettes-carottes-nouvelles-cumin',
    'crumble-sale-epinards-chevre',
    'asperges-roties-oeuf-mollet-chapelure-citronnee',
    'tian-courgettes-tomates-aubergines',
    'gaspacho-tomates-concombre-basilic',
    'courgettes-farcies-quinoa-herbes',
    'poivrons-grilles-marines-ail',
    'salade-tomates-haricots-verts-noisettes',
    'beignets-courgette-mais',
    'aubergines-roties-yaourt-sesame',
    'tarte-fine-tomates-moutarde',
    'curry-courge-pois-chiches',
    'parmentier-lentilles-patate-douce',
    'salade-betteraves-pomme-noix',
    'tarte-poireaux-chevre',
    'risotto-potimarron-sauge',
    'chou-rouge-braise-pommes',
    'courge-spaghetti-sauce-tomate-olives',
    'poelee-champignons-courge-persil',
    'soupe-poireaux-pommes-terre',
    'potee-vegetale-chou-legumes-racines',
    'tarte-tatin-oignons-confits',
    'poireaux-vinaigrette-noisettes',
    'puree-celeri-rave-pommes-terre',
    'chou-kale-saute-ail-citron',
    'endives-braisees-orange',
    'croquettes-chou-fleur-curry'
);
