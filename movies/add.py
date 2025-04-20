movies = [
    "antman_and_the_wasp_quantumania",
    "avengers_age_of_ultron",
    "avengers_endgame",
    "avengers_infinity_war",
    "batman_begins",
    "black_panther",
    "black_panther_wakanda_forever",
    "black_widow",
    "captain_america_brave_new_world",
    "captain_america_civil_war",
    "captain_america_the_first_avenger",
    "captain_america_the_winter_soldier",
    "captain_marvel",
    "cars",
    "cars_2",
    "cars_3",
    "deadpool_and_wolverine",
    "doctor_strange",
    "doctor_strange_multiverse_of_madness",
    "eternals",
    "guardians_of_the_galaxy",
    "guardians_of_the_galaxy_2",
    "guardians_of_the_galaxy_3",
    "interstellar",
    "iron_man",
    "iron_man_2",
    "iron_man_3",
    "lord_of_the_rings",
    "lord_of_the_rings_2",
    "lord_of_the_rings_3",
    "mean_girls",
    "minecraft_movie_325",
    "shangchi_and_the_legend_of_the_ten_rings",
    "shrek",
    "shrek_2",
    "shrek_3",
    "shrek_4",
    "spiderman_far_from_home",
    "spiderman_homecoming",
    "spiderman_no_way_home",
    "star_wars_episode_i",
    "star_wars_episode_ii",
    "star_wars_episode_iii",
    "star_wars_episode_iv",
    "star_wars_episode_ix",
    "star_wars_episode_v",
    "star_wars_episode_viii",
    "the_avengers",
    "the_incredible_hulk",
    "the_marvels",
    "thor",
    "thor_love_and_thunder",
    "thor_ragnarok",
    "thor_the_dark_world",
    "top_gun",
    "top_gun_maverick"
]

with open("./movies.json", "w") as f:
    f.write("[\n")
    for i, movie_id in enumerate(movies):
        movie_name = movie_id.replace("_", " ").title()
        entry = f'{{"id": "{movie_id}","name": "{movie_name}","imgSrc": "./img/{movie_id}.jpg"}}'
        if i < len(movies) - 1:
            entry += ","
        f.write(entry + "\n")
    f.write("]")