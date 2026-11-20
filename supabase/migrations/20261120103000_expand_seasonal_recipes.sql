-- Complète le catalogue public avec huit recettes originales par saison.
-- Les deux recettes déjà présentes dans chaque saison sont conservées.
-- Quelques photos de la galerie sont réutilisées volontairement : elles sont
-- déjà optimisées et le navigateur ne les télécharge qu'une fois.
do $$
declare
    recipe jsonb;
    saved_id uuid;
begin
    for recipe in
        select value
        from jsonb_array_elements($recipes$
        [
          {
            "title": "Risotto aux petits pois, épinards et citron",
            "slug": "risotto-petits-pois-epinards-citron",
            "season": "spring",
            "summary": "Un risotto crémeux et frais qui associe petits pois, jeunes pousses d’épinards et zeste de citron.",
            "category": "Plat",
            "preparation": 15,
            "cooking": 30,
            "servings": 4,
            "image_path": "https://ebvjdhpqbhlknamosnqm.supabase.co/storage/v1/object/public/medias/gallery/initial/DSC045421.webp",
            "image_alt": "Mains ouvrant une cosse de petits pois fraîchement récoltée",
            "tips": "Ajoutez les épinards au dernier moment pour conserver leur couleur et leur fraîcheur.",
            "position": 12,
            "ingredients": [
              {"quantity": "300 g", "name": "riz à risotto"},
              {"quantity": "250 g", "name": "petits pois écossés"},
              {"quantity": "120 g", "name": "jeunes pousses d’épinards"},
              {"quantity": "1", "name": "oignon nouveau"},
              {"quantity": "1 l", "name": "bouillon de légumes chaud"},
              {"quantity": "1", "name": "citron bio"},
              {"quantity": "60 g", "name": "parmesan râpé"},
              {"quantity": "2 c. à soupe", "name": "huile d’olive"}
            ],
            "steps": [
              {"description": "Émincer l’oignon nouveau et le faire fondre dans l’huile sans coloration."},
              {"description": "Ajouter le riz, remuer deux minutes, puis incorporer le bouillon chaud louche après louche."},
              {"description": "Après quinze minutes, ajouter les petits pois et poursuivre la cuisson jusqu’à ce que le riz soit tendre."},
              {"description": "Hors du feu, incorporer les épinards, le parmesan, le zeste et un trait de jus de citron."}
            ]
          },
          {
            "title": "Soupe de poireaux et pommes de terre",
            "slug": "soupe-poireaux-pommes-terre",
            "season": "winter",
            "summary": "Une soupe familiale, simple et veloutée, qui met à l’honneur le poireau d’hiver.",
            "category": "Entrée",
            "preparation": 15,
            "cooking": 35,
            "servings": 6,
            "image_path": "https://ebvjdhpqbhlknamosnqm.supabase.co/storage/v1/object/public/medias/gallery/initial/230817poireauxdhiver.webp",
            "image_alt": "Champ de poireaux d’hiver du GAEC Chimounet",
            "tips": "Gardez un peu de vert tendre du poireau pour donner davantage de couleur à la soupe.",
            "position": 42,
            "ingredients": [
              {"quantity": "5", "name": "poireaux"},
              {"quantity": "600 g", "name": "pommes de terre"},
              {"quantity": "1", "name": "oignon"},
              {"quantity": "1,2 l", "name": "bouillon de légumes"},
              {"quantity": "15 cl", "name": "crème"},
              {"quantity": "20 g", "name": "beurre"},
              {"quantity": "1 pincée", "name": "muscade"}
            ],
            "steps": [
              {"description": "Nettoyer soigneusement les poireaux et les émincer avec l’oignon."},
              {"description": "Les faire fondre dix minutes dans le beurre sans les colorer."},
              {"description": "Ajouter les pommes de terre en cubes et le bouillon, puis cuire vingt-cinq minutes."},
              {"description": "Mixer avec la crème, assaisonner de muscade, de sel et de poivre."}
            ]
          },
          {
            "title": "Potée végétale au chou et aux légumes racines",
            "slug": "potee-vegetale-chou-legumes-racines",
            "season": "winter",
            "summary": "Un plat mijoté complet et chaleureux, rempli de chou, carottes, navets et haricots blancs.",
            "category": "Plat",
            "preparation": 25,
            "cooking": 60,
            "servings": 6,
            "image_path": "https://ebvjdhpqbhlknamosnqm.supabase.co/storage/v1/object/public/medias/gallery/initial/230802serre.webp",
            "image_alt": "Serres du GAEC Chimounet pendant la saison froide",
            "tips": "Préparez la potée la veille : les saveurs se développent encore au réchauffage.",
            "position": 43,
            "ingredients": [
              {"quantity": "1 demi", "name": "chou vert"},
              {"quantity": "4", "name": "carottes"},
              {"quantity": "3", "name": "navets"},
              {"quantity": "3", "name": "poireaux"},
              {"quantity": "600 g", "name": "pommes de terre"},
              {"quantity": "400 g", "name": "haricots blancs cuits"},
              {"quantity": "1,5 l", "name": "bouillon de légumes"},
              {"quantity": "1 bouquet", "name": "garni"}
            ],
            "steps": [
              {"description": "Blanchir le chou cinq minutes dans l’eau bouillante, puis l’égoutter."},
              {"description": "Couper tous les légumes en gros morceaux et les placer dans une cocotte."},
              {"description": "Ajouter le chou, le bouquet garni et le bouillon, puis mijoter quarante-cinq minutes."},
              {"description": "Ajouter les haricots blancs et poursuivre la cuisson quinze minutes avant de servir."}
            ]
          },
          {
            "title": "Tarte tatin aux oignons confits",
            "slug": "tarte-tatin-oignons-confits",
            "season": "winter",
            "summary": "Une tarte renversée aux oignons fondants, légèrement caramélisés au vinaigre balsamique.",
            "category": "Plat",
            "preparation": 20,
            "cooking": 45,
            "servings": 6,
            "image_path": "https://ebvjdhpqbhlknamosnqm.supabase.co/storage/v1/object/public/medias/gallery/initial/230817poireauxdhiver.webp",
            "image_alt": "Cultures d’hiver du GAEC Chimounet",
            "tips": "Choisissez des oignons de taille proche pour former une rosace régulière.",
            "position": 44,
            "ingredients": [
              {"quantity": "8", "name": "oignons moyens"},
              {"quantity": "1", "name": "pâte feuilletée"},
              {"quantity": "30 g", "name": "beurre"},
              {"quantity": "1 c. à soupe", "name": "sucre roux"},
              {"quantity": "2 c. à soupe", "name": "vinaigre balsamique"},
              {"quantity": "3 branches", "name": "thym"},
              {"quantity": "1 pincée", "name": "sel"}
            ],
            "steps": [
              {"description": "Peler les oignons, les couper en deux et les faire dorer côté coupé dans le beurre."},
              {"description": "Ajouter sucre, vinaigre et thym, puis laisser confire quinze minutes à couvert."},
              {"description": "Ranger les oignons dans un moule côté coupé vers le fond et recouvrir de pâte."},
              {"description": "Cuire trente minutes à 190 °C, attendre cinq minutes puis retourner la tarte."}
            ]
          },
          {
            "title": "Poireaux vinaigrette aux noisettes",
            "slug": "poireaux-vinaigrette-noisettes",
            "season": "winter",
            "summary": "Des poireaux fondants servis tièdes avec une vinaigrette relevée et des noisettes croquantes.",
            "category": "Entrée",
            "preparation": 15,
            "cooking": 20,
            "servings": 4,
            "image_path": "https://ebvjdhpqbhlknamosnqm.supabase.co/storage/v1/object/public/medias/gallery/initial/230802serre.webp",
            "image_alt": "Production maraîchère sous serre en hiver",
            "tips": "Égouttez les poireaux tête en bas quelques minutes pour éviter qu’ils ne diluent la vinaigrette.",
            "position": 45,
            "ingredients": [
              {"quantity": "8 petits", "name": "poireaux"},
              {"quantity": "60 g", "name": "noisettes"},
              {"quantity": "1 c. à soupe", "name": "moutarde à l’ancienne"},
              {"quantity": "2 c. à soupe", "name": "vinaigre de cidre"},
              {"quantity": "4 c. à soupe", "name": "huile de noisette ou d’olive"},
              {"quantity": "1", "name": "échalote"},
              {"quantity": "1 poignée", "name": "persil"}
            ],
            "steps": [
              {"description": "Nettoyer les poireaux en conservant le blanc et un peu de vert tendre."},
              {"description": "Les cuire quinze à vingt minutes à la vapeur, puis les laisser tiédir et s’égoutter."},
              {"description": "Mélanger moutarde, vinaigre, huile, échalote hachée, sel et poivre."},
              {"description": "Napper les poireaux de vinaigrette et parsemer de noisettes grillées et de persil."}
            ]
          },
          {
            "title": "Purée de céleri-rave et pommes de terre",
            "slug": "puree-celeri-rave-pommes-terre",
            "season": "winter",
            "summary": "Une purée douce et parfumée qui accompagne aussi bien un plat mijoté qu’une poêlée de légumes.",
            "category": "Accompagnement",
            "preparation": 15,
            "cooking": 30,
            "servings": 6,
            "image_path": "https://ebvjdhpqbhlknamosnqm.supabase.co/storage/v1/object/public/medias/gallery/initial/230817poireauxdhiver.webp",
            "image_alt": "Légumes récoltés en hiver au GAEC Chimounet",
            "tips": "Passez les légumes au presse-purée plutôt qu’au mixeur pour éviter une texture collante.",
            "position": 46,
            "ingredients": [
              {"quantity": "700 g", "name": "céleri-rave"},
              {"quantity": "500 g", "name": "pommes de terre"},
              {"quantity": "20 cl", "name": "lait chaud"},
              {"quantity": "40 g", "name": "beurre"},
              {"quantity": "1 pincée", "name": "muscade"},
              {"quantity": "1 c. à soupe", "name": "jus de citron"}
            ],
            "steps": [
              {"description": "Éplucher le céleri et les pommes de terre, puis les couper en cubes de même taille."},
              {"description": "Les cuire ensemble vingt-cinq à trente minutes dans l’eau salée."},
              {"description": "Égoutter soigneusement et écraser au presse-purée avec le beurre."},
              {"description": "Ajouter progressivement le lait chaud, le citron et la muscade, puis rectifier l’assaisonnement."}
            ]
          },
          {
            "title": "Chou kale sauté à l’ail et au citron",
            "slug": "chou-kale-saute-ail-citron",
            "season": "winter",
            "summary": "Un accompagnement vert, rapide et savoureux, avec des feuilles de kale encore légèrement croquantes.",
            "category": "Accompagnement",
            "preparation": 15,
            "cooking": 10,
            "servings": 4,
            "image_path": "https://ebvjdhpqbhlknamosnqm.supabase.co/storage/v1/object/public/medias/gallery/initial/230802serre.webp",
            "image_alt": "Cultures vertes protégées sous serre en hiver",
            "tips": "Massez rapidement les feuilles avec une goutte d’huile avant cuisson pour les attendrir.",
            "position": 47,
            "ingredients": [
              {"quantity": "2 bottes", "name": "chou kale"},
              {"quantity": "2", "name": "gousses d’ail"},
              {"quantity": "1", "name": "citron"},
              {"quantity": "2 c. à soupe", "name": "huile d’olive"},
              {"quantity": "30 g", "name": "graines de tournesol"},
              {"quantity": "1 pincée", "name": "piment doux"}
            ],
            "steps": [
              {"description": "Retirer les tiges épaisses du kale, laver les feuilles et les déchirer grossièrement."},
              {"description": "Faire griller les graines de tournesol à sec puis les réserver."},
              {"description": "Faire revenir l’ail dans l’huile, ajouter le kale et cuire six à huit minutes à feu vif."},
              {"description": "Ajouter jus et zeste de citron, piment doux et graines grillées avant de servir."}
            ]
          },
          {
            "title": "Endives braisées à l’orange",
            "slug": "endives-braisees-orange",
            "season": "winter",
            "summary": "Des endives doucement braisées, équilibrées par le jus d’orange et une pointe de miel.",
            "category": "Accompagnement",
            "preparation": 10,
            "cooking": 35,
            "servings": 4,
            "image_path": "https://ebvjdhpqbhlknamosnqm.supabase.co/storage/v1/object/public/medias/gallery/initial/230817poireauxdhiver.webp",
            "image_alt": "Parcelle de légumes cultivée pendant l’hiver",
            "tips": "Retirez un petit cône à la base des endives si vous souhaitez atténuer leur amertume.",
            "position": 48,
            "ingredients": [
              {"quantity": "8", "name": "endives"},
              {"quantity": "2", "name": "oranges"},
              {"quantity": "1 c. à soupe", "name": "miel"},
              {"quantity": "25 g", "name": "beurre"},
              {"quantity": "15 cl", "name": "bouillon de légumes"},
              {"quantity": "1 pincée", "name": "sel"},
              {"quantity": "1 tour", "name": "poivre"}
            ],
            "steps": [
              {"description": "Couper les endives en deux dans la longueur et retirer la partie dure de la base."},
              {"description": "Les faire dorer côté coupé dans le beurre pendant cinq minutes."},
              {"description": "Ajouter jus et zeste d’une orange, miel et bouillon, puis couvrir."},
              {"description": "Braiser trente minutes à feu doux et faire réduire le jus quelques minutes sans couvercle."}
            ]
          },
          {
            "title": "Croquettes de chou-fleur au curry",
            "slug": "croquettes-chou-fleur-curry",
            "season": "winter",
            "summary": "Des croquettes dorées au four, croustillantes dehors et fondantes à cœur.",
            "category": "Plat",
            "preparation": 25,
            "cooking": 30,
            "servings": 4,
            "image_path": "https://ebvjdhpqbhlknamosnqm.supabase.co/storage/v1/object/public/medias/gallery/initial/230802serre.webp",
            "image_alt": "Légumes d’hiver cultivés au GAEC Chimounet",
            "tips": "Laissez refroidir le chou-fleur après cuisson afin que la préparation soit facile à façonner.",
            "position": 49,
            "ingredients": [
              {"quantity": "1", "name": "chou-fleur"},
              {"quantity": "2", "name": "œufs"},
              {"quantity": "100 g", "name": "chapelure"},
              {"quantity": "60 g", "name": "fromage râpé"},
              {"quantity": "1 c. à café", "name": "curry doux"},
              {"quantity": "1", "name": "oignon nouveau ou échalote"},
              {"quantity": "2 c. à soupe", "name": "huile d’olive"}
            ],
            "steps": [
              {"description": "Détailler le chou-fleur et le cuire à la vapeur jusqu’à ce qu’il soit tendre."},
              {"description": "L’écraser grossièrement puis mélanger avec œufs, fromage, curry, échalote et la moitié de la chapelure."},
              {"description": "Former des croquettes, les rouler dans la chapelure restante et les déposer sur une plaque huilée."},
              {"description": "Cuire vingt-cinq à trente minutes à 200 °C en les retournant à mi-cuisson."}
            ]
          },
          {
            "title": "Curry de courge et pois chiches",
            "slug": "curry-courge-pois-chiches",
            "season": "autumn",
            "summary": "Un curry doux et réconfortant où la courge fond dans une sauce parfumée au lait de coco.",
            "category": "Plat",
            "preparation": 20,
            "cooking": 35,
            "servings": 4,
            "image_path": "https://ebvjdhpqbhlknamosnqm.supabase.co/storage/v1/object/public/medias/gallery/initial/230802champs.webp",
            "image_alt": "Champs du GAEC Chimounet à la saison des récoltes",
            "tips": "Ajoutez une poignée d’épinards ou de feuilles de blettes cinq minutes avant la fin.",
            "position": 32,
            "ingredients": [
              {"quantity": "800 g", "name": "courge"},
              {"quantity": "400 g", "name": "pois chiches cuits"},
              {"quantity": "40 cl", "name": "lait de coco"},
              {"quantity": "1", "name": "oignon"},
              {"quantity": "2", "name": "gousses d’ail"},
              {"quantity": "1 c. à soupe", "name": "curry doux"},
              {"quantity": "1 c. à café", "name": "gingembre râpé"},
              {"quantity": "2 c. à soupe", "name": "huile"}
            ],
            "steps": [
              {"description": "Éplucher la courge, retirer les graines et couper la chair en cubes."},
              {"description": "Faire revenir l’oignon, l’ail, le gingembre et le curry dans l’huile."},
              {"description": "Ajouter la courge, le lait de coco et un petit verre d’eau, puis mijoter vingt-cinq minutes."},
              {"description": "Ajouter les pois chiches, poursuivre dix minutes et servir avec du riz."}
            ]
          },
          {
            "title": "Parmentier de lentilles et patate douce",
            "slug": "parmentier-lentilles-patate-douce",
            "season": "autumn",
            "summary": "Un parmentier végétal généreux, couvert d’une purée de patate douce onctueuse.",
            "category": "Plat",
            "preparation": 25,
            "cooking": 45,
            "servings": 6,
            "image_path": "https://ebvjdhpqbhlknamosnqm.supabase.co/storage/v1/object/public/medias/gallery/initial/230802aude.webp",
            "image_alt": "Légumes d’automne présentés sur le stand du GAEC Chimounet",
            "tips": "La garniture aux lentilles peut être préparée un jour à l’avance.",
            "position": 33,
            "ingredients": [
              {"quantity": "1 kg", "name": "patates douces"},
              {"quantity": "250 g", "name": "lentilles vertes"},
              {"quantity": "2", "name": "carottes"},
              {"quantity": "1", "name": "oignon"},
              {"quantity": "2", "name": "branches de céleri"},
              {"quantity": "40 cl", "name": "bouillon de légumes"},
              {"quantity": "20 cl", "name": "lait"},
              {"quantity": "2 c. à soupe", "name": "huile d’olive"}
            ],
            "steps": [
              {"description": "Cuire les patates douces en cubes dans l’eau salée, puis les écraser avec le lait."},
              {"description": "Faire revenir oignon, carottes et céleri finement coupés pendant dix minutes."},
              {"description": "Ajouter les lentilles et le bouillon, puis cuire jusqu’à absorption et assaisonner."},
              {"description": "Verser les lentilles dans un plat, couvrir de purée et gratiner vingt minutes à 200 °C."}
            ]
          },
          {
            "title": "Salade de betteraves, pomme et noix",
            "slug": "salade-betteraves-pomme-noix",
            "season": "autumn",
            "summary": "Une salade croquante et acidulée qui équilibre la douceur de la betterave.",
            "category": "Entrée",
            "preparation": 15,
            "cooking": 45,
            "servings": 4,
            "image_path": "https://ebvjdhpqbhlknamosnqm.supabase.co/storage/v1/object/public/medias/gallery/initial/230802champs.webp",
            "image_alt": "Paysage agricole du GAEC Chimounet en automne",
            "tips": "Cuisez plusieurs betteraves en même temps : elles se gardent quatre jours au frais.",
            "position": 34,
            "ingredients": [
              {"quantity": "500 g", "name": "betteraves"},
              {"quantity": "1", "name": "pomme acidulée"},
              {"quantity": "80 g", "name": "cerneaux de noix"},
              {"quantity": "100 g", "name": "fromage de brebis"},
              {"quantity": "1", "name": "échalote"},
              {"quantity": "2 c. à soupe", "name": "vinaigre de cidre"},
              {"quantity": "3 c. à soupe", "name": "huile de noix"}
            ],
            "steps": [
              {"description": "Cuire les betteraves entières à la vapeur jusqu’à ce qu’elles soient tendres, puis les laisser refroidir."},
              {"description": "Peler et couper les betteraves en dés, puis détailler la pomme en fines lamelles."},
              {"description": "Mélanger le vinaigre, l’huile, l’échalote hachée, du sel et du poivre."},
              {"description": "Réunir les ingrédients, ajouter les noix et le fromage émietté, puis assaisonner."}
            ]
          },
          {
            "title": "Tarte aux poireaux et au chèvre",
            "slug": "tarte-poireaux-chevre",
            "season": "autumn",
            "summary": "Une tarte fondante aux poireaux doucement revenus et au fromage de chèvre.",
            "category": "Plat",
            "preparation": 20,
            "cooking": 45,
            "servings": 6,
            "image_path": "https://ebvjdhpqbhlknamosnqm.supabase.co/storage/v1/object/public/medias/gallery/initial/230802aude.webp",
            "image_alt": "Légumes de saison sur le stand du GAEC Chimounet",
            "tips": "Laissez les poireaux tiédir avant de les mélanger aux œufs pour garder une garniture homogène.",
            "position": 35,
            "ingredients": [
              {"quantity": "1", "name": "pâte brisée"},
              {"quantity": "4", "name": "poireaux"},
              {"quantity": "150 g", "name": "bûche de chèvre"},
              {"quantity": "3", "name": "œufs"},
              {"quantity": "20 cl", "name": "crème"},
              {"quantity": "20 g", "name": "beurre"},
              {"quantity": "1 pincée", "name": "muscade"}
            ],
            "steps": [
              {"description": "Nettoyer et émincer les poireaux, puis les faire fondre vingt minutes avec le beurre."},
              {"description": "Foncer un moule avec la pâte et piquer le fond."},
              {"description": "Battre les œufs avec la crème, la muscade, du sel et du poivre, puis ajouter les poireaux."},
              {"description": "Verser sur la pâte, répartir le chèvre en rondelles et cuire trente-cinq minutes à 190 °C."}
            ]
          },
          {
            "title": "Risotto de potimarron à la sauge",
            "slug": "risotto-potimarron-sauge",
            "season": "autumn",
            "summary": "Un risotto velouté au potimarron, parfumé de sauge et de parmesan.",
            "category": "Plat",
            "preparation": 15,
            "cooking": 35,
            "servings": 4,
            "image_path": "https://ebvjdhpqbhlknamosnqm.supabase.co/storage/v1/object/public/medias/gallery/initial/230802champs.webp",
            "image_alt": "Champs cultivés du GAEC Chimounet en automne",
            "tips": "Rôtir une partie du potimarron apporte une saveur plus intense et une jolie garniture.",
            "position": 36,
            "ingredients": [
              {"quantity": "300 g", "name": "riz à risotto"},
              {"quantity": "600 g", "name": "potimarron"},
              {"quantity": "1", "name": "oignon"},
              {"quantity": "1 l", "name": "bouillon de légumes"},
              {"quantity": "8 feuilles", "name": "sauge"},
              {"quantity": "70 g", "name": "parmesan"},
              {"quantity": "30 g", "name": "beurre"}
            ],
            "steps": [
              {"description": "Couper le potimarron en petits dés et en cuire les deux tiers à la vapeur."},
              {"description": "Faire fondre l’oignon avec la moitié du beurre, ajouter le riz et le nacrer."},
              {"description": "Incorporer progressivement le bouillon, puis ajouter le potimarron cuit après quinze minutes."},
              {"description": "Terminer avec le parmesan, le beurre restant et la sauge ciselée."}
            ]
          },
          {
            "title": "Chou rouge braisé aux pommes",
            "slug": "chou-rouge-braise-pommes",
            "season": "autumn",
            "summary": "Un accompagnement doux et acidulé où le chou rouge mijote lentement avec pomme et épices.",
            "category": "Accompagnement",
            "preparation": 15,
            "cooking": 60,
            "servings": 6,
            "image_path": "https://ebvjdhpqbhlknamosnqm.supabase.co/storage/v1/object/public/medias/gallery/initial/230802aude.webp",
            "image_alt": "Étal de légumes d’automne du GAEC Chimounet",
            "tips": "Ce plat est encore meilleur réchauffé le lendemain.",
            "position": 37,
            "ingredients": [
              {"quantity": "1 petit", "name": "chou rouge"},
              {"quantity": "2", "name": "pommes"},
              {"quantity": "1", "name": "oignon rouge"},
              {"quantity": "2 c. à soupe", "name": "vinaigre de cidre"},
              {"quantity": "20 cl", "name": "jus de pomme"},
              {"quantity": "1", "name": "feuille de laurier"},
              {"quantity": "1 pincée", "name": "cannelle"},
              {"quantity": "20 g", "name": "beurre"}
            ],
            "steps": [
              {"description": "Émincer finement le chou et l’oignon, puis couper les pommes en dés."},
              {"description": "Faire fondre l’oignon dans le beurre, ajouter le chou et remuer cinq minutes."},
              {"description": "Ajouter pommes, vinaigre, jus de pomme, laurier et cannelle."},
              {"description": "Couvrir et laisser mijoter une heure à feu doux en remuant de temps en temps."}
            ]
          },
          {
            "title": "Courge spaghetti à la sauce tomate et aux olives",
            "slug": "courge-spaghetti-sauce-tomate-olives",
            "season": "autumn",
            "summary": "Les filaments de courge sont servis comme des pâtes avec une sauce tomate généreuse.",
            "category": "Plat",
            "preparation": 15,
            "cooking": 50,
            "servings": 4,
            "image_path": "https://ebvjdhpqbhlknamosnqm.supabase.co/storage/v1/object/public/medias/gallery/initial/230802champs.webp",
            "image_alt": "Cultures du GAEC Chimounet après la récolte estivale",
            "tips": "Ne prolongez pas trop la cuisson de la courge afin que ses filaments restent fermes.",
            "position": 38,
            "ingredients": [
              {"quantity": "1 grosse", "name": "courge spaghetti"},
              {"quantity": "500 g", "name": "tomates concassées"},
              {"quantity": "1", "name": "oignon"},
              {"quantity": "2", "name": "gousses d’ail"},
              {"quantity": "80 g", "name": "olives noires"},
              {"quantity": "1 c. à café", "name": "origan"},
              {"quantity": "2 c. à soupe", "name": "huile d’olive"}
            ],
            "steps": [
              {"description": "Couper la courge en deux, retirer les graines et la cuire face coupée vers le bas quarante minutes à 190 °C."},
              {"description": "Faire revenir oignon et ail, puis ajouter tomates, origan et olives et mijoter vingt minutes."},
              {"description": "Gratter la chair de la courge à la fourchette pour former les filaments."},
              {"description": "Mélanger délicatement avec la sauce tomate et servir bien chaud."}
            ]
          },
          {
            "title": "Poêlée de champignons, courge et persil",
            "slug": "poelee-champignons-courge-persil",
            "season": "autumn",
            "summary": "Une poêlée automnale rapide qui marie courge dorée, champignons et persil frais.",
            "category": "Accompagnement",
            "preparation": 15,
            "cooking": 25,
            "servings": 4,
            "image_path": "https://ebvjdhpqbhlknamosnqm.supabase.co/storage/v1/object/public/medias/gallery/initial/230802aude.webp",
            "image_alt": "Sélection de légumes d’automne du GAEC Chimounet",
            "tips": "Cuisez les champignons à feu vif et sans les entasser pour qu’ils dorent au lieu de rendre leur eau.",
            "position": 39,
            "ingredients": [
              {"quantity": "500 g", "name": "courge butternut"},
              {"quantity": "400 g", "name": "champignons"},
              {"quantity": "1", "name": "échalote"},
              {"quantity": "1", "name": "gousse d’ail"},
              {"quantity": "1 poignée", "name": "persil"},
              {"quantity": "2 c. à soupe", "name": "huile d’olive"},
              {"quantity": "15 g", "name": "beurre"}
            ],
            "steps": [
              {"description": "Couper la courge en petits cubes et les faire dorer quinze minutes dans l’huile."},
              {"description": "Réserver la courge, puis saisir les champignons émincés à feu vif avec le beurre."},
              {"description": "Ajouter échalote et ail hachés, puis remettre la courge dans la poêle."},
              {"description": "Assaisonner, parsemer généreusement de persil et servir immédiatement."}
            ]
          },
          {
            "title": "Tian de courgettes, tomates et aubergines",
            "slug": "tian-courgettes-tomates-aubergines",
            "season": "summer",
            "summary": "Un grand classique de l’été où les légumes confisent doucement avec l’ail et les herbes.",
            "category": "Accompagnement",
            "preparation": 20,
            "cooking": 55,
            "servings": 6,
            "image_path": "https://ebvjdhpqbhlknamosnqm.supabase.co/storage/v1/object/public/medias/gallery/initial/230804tomateronde.webp",
            "image_alt": "Tomates rondes mûres cultivées au GAEC Chimounet",
            "tips": "Serrez bien les rondelles dans le plat afin qu’elles restent moelleuses pendant la cuisson.",
            "position": 22,
            "ingredients": [
              {"quantity": "3", "name": "courgettes"},
              {"quantity": "5", "name": "tomates"},
              {"quantity": "2", "name": "aubergines"},
              {"quantity": "2", "name": "oignons"},
              {"quantity": "3", "name": "gousses d’ail"},
              {"quantity": "4 c. à soupe", "name": "huile d’olive"},
              {"quantity": "1 c. à soupe", "name": "herbes de Provence"}
            ],
            "steps": [
              {"description": "Émincer les oignons et les faire fondre dix minutes dans une cuillère d’huile."},
              {"description": "Couper courgettes, tomates et aubergines en rondelles régulières."},
              {"description": "Étaler les oignons dans le plat, puis ranger les rondelles en les alternant et ajouter l’ail haché."},
              {"description": "Arroser d’huile, parsemer d’herbes et cuire cinquante-cinq minutes à 180 °C."}
            ]
          },
          {
            "title": "Gaspacho de tomates, concombre et basilic",
            "slug": "gaspacho-tomates-concombre-basilic",
            "season": "summer",
            "summary": "Une soupe froide désaltérante, pleine de légumes mûrs et de basilic frais.",
            "category": "Entrée",
            "preparation": 20,
            "cooking": 0,
            "servings": 6,
            "image_path": "https://ebvjdhpqbhlknamosnqm.supabase.co/storage/v1/object/public/medias/gallery/initial/230804plantstomate.webp",
            "image_alt": "Plants de tomates cultivés sous serre",
            "tips": "Préparez le gaspacho quelques heures à l’avance pour le servir très frais.",
            "position": 23,
            "ingredients": [
              {"quantity": "1 kg", "name": "tomates bien mûres"},
              {"quantity": "1", "name": "concombre"},
              {"quantity": "1", "name": "poivron rouge"},
              {"quantity": "1 petite", "name": "gousse d’ail"},
              {"quantity": "1 poignée", "name": "feuilles de basilic"},
              {"quantity": "3 c. à soupe", "name": "huile d’olive"},
              {"quantity": "1 c. à soupe", "name": "vinaigre de Xérès"},
              {"quantity": "1 tranche", "name": "pain rassis"}
            ],
            "steps": [
              {"description": "Couper grossièrement les tomates, le concombre et le poivron épépiné."},
              {"description": "Faire tremper le pain avec le vinaigre pendant cinq minutes."},
              {"description": "Mixer tous les légumes, le pain, l’ail, le basilic et l’huile jusqu’à obtenir une texture lisse."},
              {"description": "Saler, poivrer et placer au frais au moins deux heures avant de servir."}
            ]
          },
          {
            "title": "Courgettes farcies au quinoa et aux herbes",
            "slug": "courgettes-farcies-quinoa-herbes",
            "season": "summer",
            "summary": "Des courgettes généreusement garnies de quinoa, tomate et herbes fraîches.",
            "category": "Plat",
            "preparation": 25,
            "cooking": 40,
            "servings": 4,
            "image_path": "https://ebvjdhpqbhlknamosnqm.supabase.co/storage/v1/object/public/medias/gallery/initial/230804tomateronde.webp",
            "image_alt": "Légumes d’été mûrs du GAEC Chimounet",
            "tips": "La farce peut être préparée la veille et conservée au frais.",
            "position": 24,
            "ingredients": [
              {"quantity": "4 grosses", "name": "courgettes"},
              {"quantity": "180 g", "name": "quinoa"},
              {"quantity": "2", "name": "tomates"},
              {"quantity": "1", "name": "oignon"},
              {"quantity": "80 g", "name": "feta"},
              {"quantity": "1 poignée", "name": "persil et basilic"},
              {"quantity": "2 c. à soupe", "name": "huile d’olive"}
            ],
            "steps": [
              {"description": "Cuire le quinoa selon les indications puis l’égoutter."},
              {"description": "Couper les courgettes en deux, les évider et hacher leur chair."},
              {"description": "Faire revenir l’oignon, la chair de courgette et les tomates, puis mélanger avec le quinoa et les herbes."},
              {"description": "Garnir les courgettes, émietter la feta et cuire trente-cinq à quarante minutes à 190 °C."}
            ]
          },
          {
            "title": "Poivrons grillés marinés à l’ail",
            "slug": "poivrons-grilles-marines-ail",
            "season": "summer",
            "summary": "Des lanières de poivrons fondantes et parfumées, parfaites en entrée ou sur une tartine.",
            "category": "Entrée",
            "preparation": 20,
            "cooking": 30,
            "servings": 6,
            "image_path": "https://ebvjdhpqbhlknamosnqm.supabase.co/storage/v1/object/public/medias/gallery/initial/230804plantstomate.webp",
            "image_alt": "Cultures estivales sous serre",
            "tips": "Laissez mariner une nuit : les poivrons seront encore plus savoureux.",
            "position": 25,
            "ingredients": [
              {"quantity": "6", "name": "poivrons de couleurs variées"},
              {"quantity": "2", "name": "gousses d’ail"},
              {"quantity": "6 c. à soupe", "name": "huile d’olive"},
              {"quantity": "2 c. à soupe", "name": "vinaigre balsamique"},
              {"quantity": "1 poignée", "name": "basilic frais"},
              {"quantity": "1 pincée", "name": "fleur de sel"}
            ],
            "steps": [
              {"description": "Déposer les poivrons entiers sous le gril et les retourner jusqu’à ce que la peau noircisse."},
              {"description": "Les enfermer dix minutes dans un récipient couvert, puis retirer peau, graines et pédoncule."},
              {"description": "Couper la chair en lanières et ajouter l’ail finement haché."},
              {"description": "Assaisonner avec huile, vinaigre, basilic et fleur de sel, puis laisser mariner au frais."}
            ]
          },
          {
            "title": "Salade de tomates et haricots verts aux noisettes",
            "slug": "salade-tomates-haricots-verts-noisettes",
            "season": "summer",
            "summary": "Une salade complète mêlant tomates juteuses, haricots croquants et noisettes grillées.",
            "category": "Plat",
            "preparation": 20,
            "cooking": 8,
            "servings": 4,
            "image_path": "https://ebvjdhpqbhlknamosnqm.supabase.co/storage/v1/object/public/medias/gallery/initial/230804tomateronde.webp",
            "image_alt": "Tomates mûres prêtes à être cuisinées",
            "tips": "Refroidissez rapidement les haricots dans l’eau glacée pour fixer leur belle couleur verte.",
            "position": 26,
            "ingredients": [
              {"quantity": "500 g", "name": "haricots verts"},
              {"quantity": "500 g", "name": "tomates"},
              {"quantity": "2", "name": "œufs"},
              {"quantity": "60 g", "name": "noisettes"},
              {"quantity": "1", "name": "échalote"},
              {"quantity": "1 c. à café", "name": "moutarde à l’ancienne"},
              {"quantity": "3 c. à soupe", "name": "huile de noix ou d’olive"}
            ],
            "steps": [
              {"description": "Cuire les haricots sept à huit minutes dans l’eau bouillante salée, puis les refroidir."},
              {"description": "Cuire les œufs neuf minutes, les écaler et les couper en quartiers."},
              {"description": "Couper les tomates, émincer l’échalote et griller les noisettes à sec."},
              {"description": "Préparer la vinaigrette à la moutarde et réunir tous les éléments au moment de servir."}
            ]
          },
          {
            "title": "Beignets de courgette au maïs",
            "slug": "beignets-courgette-mais",
            "season": "summer",
            "summary": "Des beignets légers, croustillants sur les bords et moelleux au centre.",
            "category": "Plat",
            "preparation": 20,
            "cooking": 20,
            "servings": 4,
            "image_path": "https://ebvjdhpqbhlknamosnqm.supabase.co/storage/v1/object/public/medias/gallery/initial/230804plantstomate.webp",
            "image_alt": "Légumes d’été cultivés sous serre",
            "tips": "Salez les courgettes après les avoir essorées pour éviter qu’elles ne rendent de l’eau.",
            "position": 27,
            "ingredients": [
              {"quantity": "2", "name": "courgettes"},
              {"quantity": "150 g", "name": "grains de maïs cuits"},
              {"quantity": "2", "name": "œufs"},
              {"quantity": "100 g", "name": "farine"},
              {"quantity": "1 demi sachet", "name": "levure chimique"},
              {"quantity": "2", "name": "oignons nouveaux"},
              {"quantity": "1 poignée", "name": "coriandre ou persil"},
              {"quantity": "3 c. à soupe", "name": "huile"}
            ],
            "steps": [
              {"description": "Râper les courgettes, les presser fortement dans un torchon et émincer les oignons."},
              {"description": "Mélanger farine et levure, puis ajouter les œufs, les courgettes, le maïs et les herbes."},
              {"description": "Déposer des cuillerées de pâte dans une poêle huilée et les aplatir légèrement."},
              {"description": "Cuire trois à quatre minutes de chaque côté et servir aussitôt."}
            ]
          },
          {
            "title": "Aubergines rôties, sauce au yaourt et sésame",
            "slug": "aubergines-roties-yaourt-sesame",
            "season": "summer",
            "summary": "Des aubergines fondantes au four, relevées par une sauce fraîche au citron et au sésame.",
            "category": "Plat",
            "preparation": 15,
            "cooking": 40,
            "servings": 4,
            "image_path": "https://ebvjdhpqbhlknamosnqm.supabase.co/storage/v1/object/public/medias/gallery/initial/230804tomateronde.webp",
            "image_alt": "Légumes du soleil récoltés à maturité",
            "tips": "Quadrillez profondément la chair sans percer la peau pour accélérer la cuisson.",
            "position": 28,
            "ingredients": [
              {"quantity": "3", "name": "aubergines"},
              {"quantity": "1 pot", "name": "yaourt grec"},
              {"quantity": "1 c. à soupe", "name": "purée de sésame"},
              {"quantity": "1", "name": "citron"},
              {"quantity": "1", "name": "gousse d’ail"},
              {"quantity": "4 c. à soupe", "name": "huile d’olive"},
              {"quantity": "1 poignée", "name": "menthe fraîche"},
              {"quantity": "1 c. à soupe", "name": "graines de sésame"}
            ],
            "steps": [
              {"description": "Couper les aubergines en deux, quadriller la chair et les badigeonner d’huile."},
              {"description": "Cuire côté chair vers le haut pendant quarante minutes à 200 °C."},
              {"description": "Mélanger le yaourt, la purée de sésame, l’ail râpé et le jus de citron."},
              {"description": "Napper les aubergines, puis ajouter menthe ciselée et graines de sésame."}
            ]
          },
          {
            "title": "Tarte fine aux tomates et à la moutarde",
            "slug": "tarte-fine-tomates-moutarde",
            "season": "summer",
            "summary": "Une tarte croustillante aux tomates mûres, à la moutarde et au thym.",
            "category": "Plat",
            "preparation": 15,
            "cooking": 35,
            "servings": 4,
            "image_path": "https://ebvjdhpqbhlknamosnqm.supabase.co/storage/v1/object/public/medias/gallery/initial/230804plantstomate.webp",
            "image_alt": "Plants de tomates estivales du GAEC Chimounet",
            "tips": "Saupoudrez un peu de semoule fine sous les tomates pour absorber leur jus.",
            "position": 29,
            "ingredients": [
              {"quantity": "1", "name": "pâte feuilletée"},
              {"quantity": "5", "name": "tomates"},
              {"quantity": "2 c. à soupe", "name": "moutarde"},
              {"quantity": "40 g", "name": "semoule fine"},
              {"quantity": "60 g", "name": "fromage râpé"},
              {"quantity": "2 branches", "name": "thym"},
              {"quantity": "1 c. à soupe", "name": "huile d’olive"}
            ],
            "steps": [
              {"description": "Dérouler la pâte, la piquer et étaler la moutarde en laissant un bord libre."},
              {"description": "Saupoudrer la semoule et le fromage, puis disposer les tomates en rondelles."},
              {"description": "Ajouter thym, poivre et un filet d’huile d’olive."},
              {"description": "Cuire trente-cinq minutes à 200 °C et laisser reposer cinq minutes avant de couper."}
            ]
          },
          {
            "title": "Salade tiède de fèves, radis et chèvre frais",
            "slug": "salade-tiede-feves-radis-chevre-frais",
            "season": "spring",
            "summary": "Une salade printanière croquante et colorée, relevée par une vinaigrette douce à la moutarde.",
            "category": "Entrée",
            "preparation": 20,
            "cooking": 5,
            "servings": 4,
            "image_path": "https://ebvjdhpqbhlknamosnqm.supabase.co/storage/v1/object/public/medias/gallery/230802fraise2-27e488f3.webp",
            "image_alt": "Récolte printanière du GAEC Chimounet",
            "tips": "Retirez la peau des grosses fèves après cuisson pour une texture plus fondante.",
            "position": 13,
            "ingredients": [
              {"quantity": "400 g", "name": "fèves fraîches écossées"},
              {"quantity": "1 botte", "name": "radis roses"},
              {"quantity": "120 g", "name": "chèvre frais"},
              {"quantity": "2 poignées", "name": "jeunes pousses de salade"},
              {"quantity": "1", "name": "échalote"},
              {"quantity": "1 c. à café", "name": "moutarde"},
              {"quantity": "2 c. à soupe", "name": "vinaigre de cidre"},
              {"quantity": "3 c. à soupe", "name": "huile d’olive"}
            ],
            "steps": [
              {"description": "Cuire les fèves quatre à cinq minutes dans l’eau bouillante salée, puis les égoutter."},
              {"description": "Émincer les radis et l’échalote, puis laver et essorer les jeunes pousses."},
              {"description": "Mélanger moutarde, vinaigre et huile pour préparer la vinaigrette."},
              {"description": "Réunir les légumes encore tièdes, ajouter le chèvre émietté et assaisonner juste avant de servir."}
            ]
          },
          {
            "title": "Navets nouveaux glacés au miel et au thym",
            "slug": "navets-nouveaux-glaces-miel-thym",
            "season": "spring",
            "summary": "Des navets tendres et brillants, doucement caramélisés au miel avec une touche de thym.",
            "category": "Accompagnement",
            "preparation": 10,
            "cooking": 25,
            "servings": 4,
            "image_path": "https://ebvjdhpqbhlknamosnqm.supabase.co/storage/v1/object/public/medias/gallery/initial/DSC045421.webp",
            "image_alt": "Légumes nouveaux récoltés au printemps",
            "tips": "Gardez un petit morceau de fane sur chaque navet pour une jolie présentation.",
            "position": 14,
            "ingredients": [
              {"quantity": "800 g", "name": "navets nouveaux"},
              {"quantity": "1 c. à soupe", "name": "miel"},
              {"quantity": "25 g", "name": "beurre"},
              {"quantity": "2 branches", "name": "thym"},
              {"quantity": "20 cl", "name": "bouillon de légumes"},
              {"quantity": "1 pincée", "name": "sel"},
              {"quantity": "1 tour", "name": "poivre"}
            ],
            "steps": [
              {"description": "Brosser les navets, retirer les fanes abîmées et couper les plus gros en deux."},
              {"description": "Les placer dans une sauteuse avec le beurre, le miel, le thym et le bouillon."},
              {"description": "Couvrir et cuire quinze minutes à feu moyen jusqu’à ce qu’ils soient tendres."},
              {"description": "Retirer le couvercle et laisser réduire en remuant jusqu’à obtenir un glaçage brillant."}
            ]
          },
          {
            "title": "Omelette aux blettes et aux herbes fraîches",
            "slug": "omelette-blettes-herbes-fraiches",
            "season": "spring",
            "summary": "Une omelette généreuse aux blettes fondantes, persil et ciboulette, idéale pour un repas rapide.",
            "category": "Plat",
            "preparation": 15,
            "cooking": 15,
            "servings": 4,
            "image_path": "https://ebvjdhpqbhlknamosnqm.supabase.co/storage/v1/object/public/medias/gallery/230802fraise2-27e488f3.webp",
            "image_alt": "Produits frais de printemps du GAEC Chimounet",
            "tips": "Les côtes de blettes demandent quelques minutes de cuisson de plus que les feuilles.",
            "position": 15,
            "ingredients": [
              {"quantity": "1 botte", "name": "blettes"},
              {"quantity": "8", "name": "œufs"},
              {"quantity": "1", "name": "oignon nouveau"},
              {"quantity": "2 c. à soupe", "name": "persil haché"},
              {"quantity": "2 c. à soupe", "name": "ciboulette ciselée"},
              {"quantity": "40 g", "name": "fromage râpé"},
              {"quantity": "2 c. à soupe", "name": "huile d’olive"}
            ],
            "steps": [
              {"description": "Séparer les côtes des feuilles de blettes, puis émincer les deux parties."},
              {"description": "Faire revenir l’oignon et les côtes huit minutes, puis ajouter les feuilles trois minutes."},
              {"description": "Battre les œufs avec les herbes, le fromage, du sel et du poivre."},
              {"description": "Verser sur les blettes et cuire à feu doux jusqu’à ce que l’omelette soit prise mais encore moelleuse."}
            ]
          },
          {
            "title": "Pesto de fanes de radis aux amandes",
            "slug": "pesto-fanes-radis-amandes",
            "season": "spring",
            "summary": "Une recette anti-gaspillage, fraîche et parfumée, à servir avec des pâtes ou sur du pain grillé.",
            "category": "Sauce",
            "preparation": 15,
            "cooking": 0,
            "servings": 6,
            "image_path": "https://ebvjdhpqbhlknamosnqm.supabase.co/storage/v1/object/public/medias/gallery/initial/DSC045421.webp",
            "image_alt": "Légumes et fanes fraîchement récoltés",
            "tips": "Recouvrez le pesto d’une fine couche d’huile pour le conserver trois jours au réfrigérateur.",
            "position": 16,
            "ingredients": [
              {"quantity": "1 botte", "name": "fanes de radis bien fraîches"},
              {"quantity": "60 g", "name": "amandes"},
              {"quantity": "40 g", "name": "parmesan"},
              {"quantity": "1 petite", "name": "gousse d’ail"},
              {"quantity": "8 cl", "name": "huile d’olive"},
              {"quantity": "1 c. à soupe", "name": "jus de citron"},
              {"quantity": "1 pincée", "name": "sel"}
            ],
            "steps": [
              {"description": "Laver soigneusement les fanes, retirer les tiges épaisses et bien les sécher."},
              {"description": "Mixer les amandes, le parmesan et l’ail jusqu’à obtenir une poudre grossière."},
              {"description": "Ajouter les fanes et le jus de citron, puis mixer en versant l’huile progressivement."},
              {"description": "Rectifier l’assaisonnement et détendre avec une cuillère d’eau si nécessaire."}
            ]
          },
          {
            "title": "Galettes de carottes nouvelles au cumin",
            "slug": "galettes-carottes-nouvelles-cumin",
            "season": "spring",
            "summary": "De petites galettes dorées, moelleuses à cœur, accompagnées d’une sauce au yaourt citronnée.",
            "category": "Plat",
            "preparation": 20,
            "cooking": 20,
            "servings": 4,
            "image_path": "https://ebvjdhpqbhlknamosnqm.supabase.co/storage/v1/object/public/medias/gallery/230802fraise2-27e488f3.webp",
            "image_alt": "Récolte colorée de printemps",
            "tips": "Essorez les carottes râpées si elles rendent beaucoup d’eau afin que les galettes se tiennent bien.",
            "position": 17,
            "ingredients": [
              {"quantity": "600 g", "name": "carottes nouvelles"},
              {"quantity": "2", "name": "œufs"},
              {"quantity": "60 g", "name": "farine"},
              {"quantity": "1 c. à café", "name": "cumin moulu"},
              {"quantity": "1", "name": "oignon nouveau"},
              {"quantity": "1 pot", "name": "yaourt nature"},
              {"quantity": "1 demi", "name": "citron"},
              {"quantity": "2 c. à soupe", "name": "huile"}
            ],
            "steps": [
              {"description": "Râper les carottes et émincer finement l’oignon nouveau."},
              {"description": "Mélanger avec les œufs, la farine, le cumin, du sel et du poivre."},
              {"description": "Former de petites galettes et les cuire quatre minutes de chaque côté dans une poêle huilée."},
              {"description": "Mélanger le yaourt avec le jus de citron et servir cette sauce avec les galettes chaudes."}
            ]
          },
          {
            "title": "Crumble salé aux épinards et au chèvre",
            "slug": "crumble-sale-epinards-chevre",
            "season": "spring",
            "summary": "Des épinards fondants sous une croûte croustillante au chèvre, aux flocons d’avoine et aux noix.",
            "category": "Plat",
            "preparation": 20,
            "cooking": 30,
            "servings": 4,
            "image_path": "https://ebvjdhpqbhlknamosnqm.supabase.co/storage/v1/object/public/medias/gallery/initial/DSC045421.webp",
            "image_alt": "Légumes verts de printemps fraîchement récoltés",
            "tips": "Faites bien évaporer l’eau des épinards avant de les placer dans le plat.",
            "position": 18,
            "ingredients": [
              {"quantity": "800 g", "name": "épinards frais"},
              {"quantity": "120 g", "name": "chèvre frais"},
              {"quantity": "80 g", "name": "farine"},
              {"quantity": "60 g", "name": "flocons d’avoine"},
              {"quantity": "60 g", "name": "beurre froid"},
              {"quantity": "40 g", "name": "noix concassées"},
              {"quantity": "1", "name": "échalote"}
            ],
            "steps": [
              {"description": "Faire tomber les épinards avec l’échalote émincée, puis laisser évaporer toute l’eau."},
              {"description": "Déposer les épinards dans un plat et répartir le chèvre émietté."},
              {"description": "Sabler du bout des doigts la farine, les flocons, le beurre et les noix."},
              {"description": "Répartir le crumble sur les légumes et cuire trente minutes à 190 °C."}
            ]
          },
          {
            "title": "Asperges rôties, œuf mollet et chapelure citronnée",
            "slug": "asperges-roties-oeuf-mollet-chapelure-citronnee",
            "season": "spring",
            "summary": "Des asperges rôties encore croquantes, servies avec un œuf coulant et une chapelure parfumée.",
            "category": "Entrée",
            "preparation": 15,
            "cooking": 18,
            "servings": 4,
            "image_path": "https://ebvjdhpqbhlknamosnqm.supabase.co/storage/v1/object/public/medias/gallery/230802fraise2-27e488f3.webp",
            "image_alt": "Produits de printemps du GAEC Chimounet",
            "tips": "Choisissez des asperges de même calibre pour une cuisson uniforme.",
            "position": 19,
            "ingredients": [
              {"quantity": "2 bottes", "name": "asperges vertes"},
              {"quantity": "4", "name": "œufs"},
              {"quantity": "60 g", "name": "chapelure"},
              {"quantity": "1", "name": "citron bio"},
              {"quantity": "3 c. à soupe", "name": "huile d’olive"},
              {"quantity": "2 c. à soupe", "name": "persil haché"},
              {"quantity": "1 pincée", "name": "fleur de sel"}
            ],
            "steps": [
              {"description": "Éplucher la base des asperges et les déposer sur une plaque avec deux cuillères d’huile."},
              {"description": "Les rôtir douze à quinze minutes à 210 °C selon leur calibre."},
              {"description": "Cuire les œufs six minutes dans l’eau bouillante, puis les refroidir et les écaler."},
              {"description": "Dorer la chapelure avec le reste d’huile, le zeste de citron et le persil, puis dresser l’ensemble."}
            ]
          }
        ]
        $recipes$::jsonb)
    loop
        insert into public.recipes (
            title,
            slug,
            season,
            summary,
            category,
            preparation_time_in_minutes,
            cooking_time_in_minutes,
            servings,
            image_path,
            image_alt,
            tips,
            is_published,
            position
        ) values (
            recipe ->> 'title',
            recipe ->> 'slug',
            (recipe ->> 'season')::public.season,
            recipe ->> 'summary',
            recipe ->> 'category',
            (recipe ->> 'preparation')::integer,
            (recipe ->> 'cooking')::integer,
            (recipe ->> 'servings')::integer,
            recipe ->> 'image_path',
            recipe ->> 'image_alt',
            recipe ->> 'tips',
            true,
            (recipe ->> 'position')::integer
        )
        on conflict (slug) do update set
            title = excluded.title,
            season = excluded.season,
            summary = excluded.summary,
            category = excluded.category,
            preparation_time_in_minutes = excluded.preparation_time_in_minutes,
            cooking_time_in_minutes = excluded.cooking_time_in_minutes,
            servings = excluded.servings,
            image_path = excluded.image_path,
            image_alt = excluded.image_alt,
            tips = excluded.tips,
            is_published = excluded.is_published,
            position = excluded.position
        returning id into saved_id;

        delete from public.recipe_ingredients where recipe_id = saved_id;
        delete from public.recipe_steps where recipe_id = saved_id;

        insert into public.recipe_ingredients (recipe_id, quantity, name, position)
        select
            saved_id,
            ingredient.value ->> 'quantity',
            ingredient.value ->> 'name',
            ingredient.ordinality - 1
        from jsonb_array_elements(recipe -> 'ingredients')
            with ordinality as ingredient(value, ordinality);

        insert into public.recipe_steps (recipe_id, description, position)
        select
            saved_id,
            step.value ->> 'description',
            step.ordinality - 1
        from jsonb_array_elements(recipe -> 'steps')
            with ordinality as step(value, ordinality);
    end loop;
end
$$;
