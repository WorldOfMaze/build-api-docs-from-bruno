"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionnaire = questionnaire;
const prompts_1 = require("@inquirer/prompts");
const answer_01 = (0, prompts_1.input)({
    message: "Where is the collection of Bruno files?",
    default: "Collections",
    required: true,
});
const answer_02 = (0, prompts_1.input)({
    message: "Where should the documentation file be saved?",
    default: "documentation/api.md",
    required: true,
});
// inquirer
// 	.prompt([
// 		{
// 			type: "input",
// 			name: "destination",
// 			message: "Where should the documentation file be saved??",
// 			default: "documentation/api.md",
// 		},
// 		{
// 			type: "list",
// 			name: "outputMode",
// 			message: "How much output do you want to see?",
// 			choices: [
// 				{
// 					name: "Basic information plus errors and warnings",
// 					value: "normal",
// 				},
// 				{
// 					name: "Full details",
// 					value: "verbose",
// 				},
// 				{
// 					name: "None, not even errors",
// 					value: "silent",
// 				},
// 			],
// 		},
// 		{
// 			type: "list",
// 			name: "test",
// 			message:
// 				"Do you want to save the documentation of just test the process?",
// 			choices: [
// 				{
// 					name: "Yes, save the document to the target file",
// 					value: false,
// 				},
// 				{
// 					name: "No, justs test the process without writing the documentation",
// 					value: true,
// 				},
// 			],
// 		},
// 		{
// 			type: "confirm",
// 			name: "confirm",
// 			message:
// 				"Are you ready to continue?  If you do, the prior documentation will be overwritten.",
// 			default: true,
// 		},
// 	])
// 	.then((answers) => {
// 		console.log(answers);
// 	});
function questionnaire() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Entering questionnaire...");
        const source = yield answer_01;
        const destination = yield answer_01;
        return { source, destination };
    });
}
