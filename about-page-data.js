// This holds all of the color themes for light/dark mode
export const modes = [
	{
		mode: "light",
		properties: {
			"--text-color": "rgba(0, 0, 0, 0.6)",
			"--body-background-gradient": "linear-gradient(30deg, #b3e5fc, #ffcc80)",
			"--blob-1-gradient": "linear-gradient(0deg, #ffcc80, #ffab40)",
			"--blob-2-gradient": "linear-gradient(0deg, #b3e5fc, #4fc3f7)",
			"--blob-3-gradient": "linear-gradient(0deg, #c8e6c9, #81c784)",
			"--link-color": "#7152ff",
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
		},
	},
];

// All of the updates and their corresponding dates that will be dynamically added in the updates section on about page
export const updates = [
    { date: "10/29/24", content: "Added Jacksmith" },
    { date: "10/24/24", content: "Added Pre Civilization Bronze Age" },
    { date: "10/21/24", content: "Updated the login page user interface and styles" },
    { date: "10/20/24", content: "Added strongdog chat back, add StrongDogXP accounts, add Halloween themed update" },
    { date: "10/19/24", content: "Added conq.io and shipo.io" },
    { date: "10/17/24", content: "Added sheep party" },
    { date: "10/16/24", content: "Added tanko.io and tag" },
    { date: "10/15/24", content: "Added levil devil, friday night funkin, and fix run 3 in the secret games menu" },
    { date: "10/12/24", content: "Added a few more games like gladdihoppers" },
    { date: "10/10/24", content: "About page cleanup. Added grindcraft" },
    { date: "10/9/24", content: "Added Run 3 and Abandoned to the secret games menu. Added Pixwar 2 to page 2" },
    { date: "10/7/24", content: "Added EVEN MORE new games to the second page" },
    { date: "10/6/24", content: "Added TONS of new games to the second page" },
    { date: "10/3/24", content: "Fixed eggy car" },
    { date: "9/20/24", content: "Added block lanschool 2.0 to the secret games menu" },
    { date: "9/16/24", content: "Fixed Fnaf, removed cirkul bottle giveaway form" },
    { date: "7/27/24", content: "Fixed choppy orc game and added a new game to the secret games menu. Also added the cirkul bottle giveaway forum" },
    { date: "5/16/24", content: "Fixed one hasty shaman game" },
    { date: "5/15/24", content: "Fixed one trick mage game" },
    { date: "5/14/24", content: "Removed all and new games tabs in page 1, made the about section look better" },
    { date: "5/13/24", content: "Optimized top 10 load speed, added loading icons for top 10 and form submission, improved site styling and format" },
    { date: "5/12/24", content: "Added about section" }
];