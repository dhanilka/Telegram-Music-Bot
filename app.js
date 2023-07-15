const express = require('express');
const app = express();
const port = 5000;
require('dotenv').config();

const authToken = process.env.TOKEN;
const adminChatId = process.env.ADMINID;

const TelegramBot = require('node-telegram-bot-api');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

process.env.NTBA_FIX_319 = '1';

const bot = new TelegramBot(authToken, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username;
  const messageText = msg.text;
  
 

});

bot.on('message', (msg) => {
  const username = msg.from.username;
  const chatId = msg.chat.id;
  const messageText = msg.text;
  const firstName = msg.from.first_name;
  const lastName = msg.from.last_name;

  // console.log(chatId, ":", msg.text);

  const message = `Name = ${firstName}  ${lastName} \nUsername = ${username}\nChatID = ${chatId} \nSend : ${messageText}`;
  bot.sendMessage(adminChatId, message);

  // Check valid YouTube link
  if (ytdl.validateURL(messageText)) {
    let conversionMessageId = null;
    let progressMessageId = null;
    const timestamp = Date.now();
    const videoFilename = `video_${timestamp}.mp4`;
    const audioFilename = `audio_${timestamp}.mp3`;

    bot.sendMessage(chatId, ' Please wait... 🫶🏻')
      .then((response) => {
        conversionMessageId = response.message_id;
        // Download the YouTube video as MP4
        const videoStream = ytdl(messageText, { quality: 'highestaudio' });
        const videoFile = fs.createWriteStream(videoFilename);
        videoStream.pipe(videoFile);

        let lastProgress = -1;

        videoFile.on('finish', () => {
          // Convert the downloaded video to MP3 using ffmpeg
          const conversionProcess = ffmpeg(videoFilename)
            .outputOptions('-metadata', `title=${msg.from.first_name}_${timestamp}`)
            .output(audioFilename)
            .on('progress', (progress) => {
              // Calculate the conversion progress
              const percentage = Math.floor(progress.percent);
              if (percentage !== lastProgress) {
                lastProgress = percentage;
                const progressBar = generateProgressBar(percentage);
                const message = `Converting to mp3: ${percentage}%`;

                // Edit the progress message
                if (progressMessageId) {
                  bot.editMessageText(message, { chat_id: chatId, message_id: progressMessageId })
                    .catch((error) => {
                      console.error('Error editing progress message:', error.message);
                    });
                } else {
                  bot.sendMessage(chatId, message)
                    .then((response) => {
                      progressMessageId = response.message_id;
                    })
                    .catch((error) => {
                      console.error('Error sending progress message:', error.message);
                    });
                }
              }
            })
            .on('end', () => {
              // Send the converted MP3 file to the user
              bot.sendAudio(chatId, fs.readFileSync(audioFilename), {
                contentType: 'audio/mpeg' // Set the contentType explicitly
              }, { filename: audioFilename })
                .then(() => {
                  // Delete the progress message and the conversion message
                  if (progressMessageId) {
                    bot.deleteMessage(chatId, progressMessageId)
                      .catch((error) => {
                        console.error('Error deleting progress message:', error.message);
                      });
                  }
                  bot.deleteMessage(chatId, conversionMessageId)
                    .catch((error) => {
                      console.error('Error deleting conversion message:', error.message);
                    });

                  // Send the "Here's the result" message
                  bot.sendMessage(chatId, "Here's the result");
                })
                .catch((error) => {
                  console.error('Error sending audio file:', error.message);
                  // Delete the progress message and the conversion message
                  if (progressMessageId) {
                    bot.deleteMessage(chatId, progressMessageId)
                      .catch((error) => {
                        console.error('Error deleting progress message:', error.message);
                      });
                  }
                  bot.deleteMessage(chatId, conversionMessageId)
                    .catch((error) => {
                      console.error('Error deleting conversion message:', error.message);
                    });  
                })
                .finally(() => {
                  // Clean up the temporary files
                  fs.unlinkSync(videoFilename);
                  fs.unlinkSync(audioFilename);
                });
            })
            .run();
        });
      })
      .catch((error) => {
        console.error('Error sending conversion message:', error.message);
      });
  } else if (messageText === "/help") {
    bot.sendMessage(chatId, `Hi ${firstName}, How to use this bot?\n\n⭐️𝐒𝐞𝐧𝐝 𝐲𝐨𝐮𝐭𝐮𝐛𝐞 𝐥𝐢𝐧𝐤 𝐭𝐨 𝐜𝐨𝐧𝐯𝐞𝐫𝐭⭐️ \n\n OR \n\nType @vid<space>Search your video \nex: @vid shape of you\n\nIf you have any problem using @vid \n\n Enter /tutorial - Get video tutorial for how to use @vid`);
  } else if(messageText === "/tutorial") {
    bot.sendMessage(chatId,"Here's the tutorial")
    bot.sendVideo(chatId,'./tutorial.MP4')

  }else if(messageText === "/start"){
    bot.sendMessage(chatId, `👋 Hello ${msg.from.first_name}, I'm 𝐋𝐄𝐎 - 𝐌𝐔𝐒𝐈𝐂 𝐁𝐎𝐓\n\n⭐️ 𝙎𝙚𝙣𝙙 𝙮𝙤𝙪𝙧 𝙮𝙤𝙪𝙩𝙪𝙗𝙚 𝙡𝙞𝙣𝙠 ⭐️\n\n🪪 My username - @dhanilka_yt_bot \n\n▪️ How to use this bot 👇 \n\n/help - Get instructions on how to use LEO\n\n/turtorial - Get the video tutorial for using LEO\n\n leomusicbot v 1.0(beta) \n Bot by - @dhanilka`);
  }else{
    bot.sendMessage(chatId,`Sorry ${msg.from.first_name} , Invaild Command`);
    bot.sendMessage(chatId, `Hi ${firstName}, How to use this bot?\n\n⭐️𝐒𝐞𝐧𝐝 𝐲𝐨𝐮𝐭𝐮𝐛𝐞 𝐥𝐢𝐧𝐤 𝐭𝐨 𝐜𝐨𝐧𝐯𝐞𝐫𝐭⭐️ \n\n OR \n\nType @vid<space>Search your video \nex: @vid shape of you\n\nIf you have any problem using @vid \n\n Enter /tutorial - Get video tutorial for how to use @vid`)
  }
});

function generateProgressBar(percentage) {
  const progressBarLength = 20;
  const completed = Math.round(progressBarLength * (percentage / 100));
  const remaining = progressBarLength - completed;

  return `[${'='.repeat(completed)}${' '.repeat(remaining)}]`;
}

app.listen(port, () => console.log(`App listening on port ${port}`));
