import inquirer from "inquirer";
const answer = inquirer
    .prompt([
    {
        type: "input",
        name: "name",
        message: "What is your name?",
    },
    {
        type: "input",
        name: "age",
        message: "How old are you?",
    },
    {
        type: "list",
        name: "gender",
        message: "What is your genders?",
        choices: ["Male", "Female", "Prefer not to say"],
    },
])
    .then((answers) => {
    console.log(`Your name is ${answers.name}, you are ${answers.age} years old and you are ${answers.gender}.`);
});
const build = inquirer.prompt([
    {
        type: "input",
        name: "source",
        message: "Where id the collection of Bruno files?",
    },
]);
build.then((answers) => {
    console.log(answers);
});
