const nameInput = document.getElementById('name-input')
const emailInput = document.getElementById('email-login')
const passwordInput = document.getElementById('password-login')
const registerBtn = document.getElementById('registerBtn')
// require('../../models')

const wordsList = ["Shoe","Door", "Trash Can", "Christmas Tree"
,"Television",	"Moon",	"Eyes",	"Spider",
"Snow",	"Drum",	"Shirt", "Sad",
"Doll",	"Cup",	"Fish",	"Sandwich",
"Cookie", "Socks",	"Book",	"Pants",
"Happy", "Roof", "Candy", "Skateboard",
"Sun",	"Water", "Bed",	"Hat",
"Rooster",	"Dress", "Aeroplane", "Bubbles",
"Ocean",	"Ball",	"Banana",	"Butterfly",
"Cupcake",	"Rainbow",	"Grapes",	"Pizza",
"House",	"Sleep",	"Egg",	"Bird",
"Octopus",	"Star",	"Coffee",	"Apple",
"Mailbox",	"Nose",	"Tree",	"Cat",
"Leg",	"Lips",	"Cloud","Orange"]



let word = wordsList[Math.floor(Math.random() * wordsList.length)];

console.log(word)
document.getElementById("word").textContent = word;
