// All of the updates and their corresponding dates that will be dynamically added in the updates section on about page 
// Josh - please keep them specific to page system/ui updates and not added games, thanks
export const updates = [
	{ date: "4/6/25", content: "Added \"Declined Games\" menu in about section, fixed minor about section styling issues" },
	{ date: "4/1/25", content: "Added April Fool's update, removed the next day" },
	{ date: "2/24/25", content: "Added a card size slider to the main menu" },
	{ date: "2/10/25", content: "Added block lanschool 3.0 to secret menu" },
	{ date: "10/21/24", content: "Updated login page UI" },
	{ date: "10/20/24", content: "Restored Strongdog chat, added StrongDogXP accounts, Halloween update" },
	{ date: "10/10/24", content: "Cleaned up About page" },
	{ date: "9/20/24", content: "Added block lanschool 2.0 to secret games" },
	{ date: "7/27/24", content: "Added cirkul bottle giveaway" },
	{ date: "5/14/24", content: "Removed tabs on page 1; improved About section" },
	{ date: "5/13/24", content: "Optimized top 10 load speed; added loading icons; improved styling" },
	{ date: "5/12/24", content: "Added About section" }
];

export const refusedGamesData = [
	{ name: "Mario Kart", reason: "File too big" },
	{ name: "Sword Masters", reason: "Backend unavailable" },
	{ name: "Schedule 1", reason: "Unable to play through browser" },
	// { name: "Red Dead Redemption", reason: "" },
];

// This holds all of the color themes for light/dark mode
export const modes = [
	{
		mode: "light",
		properties: {
			"--text-color": "rgba(0, 0, 0, 0.6)",
			"--body-background-gradient": "linear-gradient(30deg, #566d78, #ffcc80)",
			"--blob-1-gradient": "linear-gradient(0deg, #ffcc80, #ffab40)",
			"--blob-2-gradient": "linear-gradient(0deg, #b3e5fc, #4fc3f7)",
			"--blob-3-gradient": "linear-gradient(0deg, #c8e6c9, #81c784)",
			"--link-color": "#7152ff",
			"--input-bg": "rgba(0, 0, 0, 0.2)",
			"--input-bg-hover": "rgba(0, 0, 0, 0.3)"
		},
	},
	{
		mode: "dark",
		properties: {
			"--text-color": "rgba(255, 255, 255, 0.9)",
			"--body-background-gradient": "linear-gradient(30deg, #010101, #000000)",
			"--blob-1-gradient": "linear-gradient(72deg, #ff2079, #0400eb)",
			"--blob-2-gradient": "linear-gradient(0deg, #440bd4, #e92efb)",
			"--blob-3-gradient": "linear-gradient(220deg, #ff2079, #0400eb)",
			"--link-color": "#9178ff",
			"--input-bg": "rgba(0, 0, 0, 0.3)",
			"--input-bg-hover": "rgba(0, 0, 0, 0.4)"
		},
	},
];
