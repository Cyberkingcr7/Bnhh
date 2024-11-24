import { Cooldown, Ctx, SectionsBuilder } from "@mengkodingan/ckptw";
import { processSubject, subjects } from "../../lib/ok";
import { askQuestion, ensureAuthenticated, sendDocument } from "../../lib/utils";
import { DatabaseHandler } from "../../db/DatabaseHandler";
import { isBotMuted } from "../../lib/main";

const dbHandler = new DatabaseHandler();
// Register the command
module.exports = {
    name: "paper",
    aliases: ["p"],
    category: "Utils",
    code: async (ctx: Ctx): Promise<void> => {
      const userId =  ctx.sender?.jid!
        const userDocSnapshot = await dbHandler.getUser(userId);
 // Check if the bot is muted
 if (isBotMuted()) {
  await ctx.reply("The bot is currently muted and cannot process this command.");
  return;
}
      if (!userDocSnapshot.exists) {
        return void ctx.reply("🟥 *User not found. Please write !register*"); // Removed unnecessary await
      }

      const cd = new Cooldown(ctx, 2000);
  
      if (cd.onCooldown) {
        ctx.reply(`Slow down... wait ${cd.timeleft}ms`);
        return; // Ensure to exit the command if on cooldown
      }
  
      try {
        // Build the subject selection menu
        const buildSubjectSection = (): SectionsBuilder => {
          return new SectionsBuilder()
            .setDisplayText("Choose a subject")
            .addSection({
              title: 'Subjects',
              rows: [
                ...subjects.map((subject, index) => ({
                  title: subject.name,
                  id: index.toString()
                })),
                { title: 'Go back', id: '-1' }
              ]
            });
        };
  
        // Build a generic menu section
        const buildSection = (title: string, items: string[]): SectionsBuilder => {
          return new SectionsBuilder()
            .setDisplayText(title)
            .addSection({
              title,
              rows: [
                ...items.map((item, index) => ({
                  title: item,
                  id: index.toString()
                })),
                { title: 'Go back', id: '-1' }
              ]
            });
        };
  
        // Get user choice from a menu
        const getChoice = async (sectionBuilder: () => SectionsBuilder, prompt: string): Promise<number> => {
          const built = sectionBuilder().build();
          const buttonParams = JSON.parse(built.buttonParamsJson);
  
          await ctx.sendInteractiveMessage(ctx.id!, {
            body: prompt,
            nativeFlowMessage: { buttons: [built] }
          });
  
          const response: string = await askQuestion(ctx, "Choose from the list:");
          const choiceIndex: number = parseInt(response, 10);
  
          if (isNaN(choiceIndex) || choiceIndex < 0 || choiceIndex >= buttonParams.sections[0].rows.length) {
            ctx.reply("Invalid choice. Please try again.");
            return getChoice(sectionBuilder, prompt);
          }
  
          return choiceIndex;
        };
  
        // Subject selection
        const chosenSubjectIndex = await getChoice(
          () => buildSubjectSection(),
          'Select a subject to fetch papers for:'
        );
  
        if (chosenSubjectIndex === -1) {
          ctx.reply("Going back to the main menu.");
          return;
        }
  
        const chosenSubject = subjects[chosenSubjectIndex];
        const paperData = await processSubject(chosenSubjectIndex);
  
        if (!paperData) {
          ctx.reply(`No papers found for ${chosenSubject.name}.`);
          return;
        }
  
        // Province selection
        const provinces = Object.keys(paperData);
        const chosenProvinceIndex = await getChoice(
          () => buildSection('Choose a province', provinces),
          `Select a province for ${chosenSubject.name}:`
        );
  
        if (chosenProvinceIndex === -1) {
          ctx.reply("Going back to the subject selection.");
          return;
        }
  
        const chosenProvince = provinces[chosenProvinceIndex];
        const papersByYear = paperData[chosenProvince];
        const uniqueYears: string[] = Array.from(new Set(Object.keys(papersByYear || {})));
  
        // Year selection
        const chosenYearIndex = await getChoice(
          () => buildSection('Choose a year', uniqueYears),
          `Select a year for ${chosenSubject.name} in ${chosenProvince}:`
        );
  
        if (chosenYearIndex === -1) {
          ctx.reply("Going back to the province selection.");
          return;
        }
  
        const chosenYear: string = uniqueYears[chosenYearIndex];
        const papersForYear: { title: string; url: string }[] = papersByYear[chosenYear] || [];

  
        if (papersForYear.length === 0) {
          ctx.reply(`No papers found for ${chosenYear} in ${chosenSubject.name} (${chosenProvince}).`);
          return;
        }
  
     // Building the menu
const numberedTitles = papersForYear.map((paper, index) => `${index + 1}. ${paper.title}`);

const chosenPaperIndex = await getChoice(
  () => buildSection('Choose a paper', numberedTitles),
  `Here are the papers for ${chosenSubject.name} (${chosenYear}) in ${chosenProvince}:\n${numberedTitles.join('\n')}`
);

if (chosenPaperIndex === -1) {
  ctx.reply("Going back to the year selection.");
  return;
}

const chosenPaper = papersForYear[chosenPaperIndex];
const newFileName = chosenPaper.title; // Use the title for naming the file

await sendDocument(ctx, chosenPaper.url, newFileName); // Use the URL for downloading

  
      } catch (error: any) {
        console.error('Error handling command:', error.message);
        ctx.reply('An error occurred while processing your request. Please try again.');
      }   }}