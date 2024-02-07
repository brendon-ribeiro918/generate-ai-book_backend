
const { generatePDF } = require("../utils/pdfUtils");
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY);

// Store the vector data into the Cloud Service Platform
async function insertVectors(set, vectorData) {
    const { data, error } = await supabase
        .from(`${set}_vector`)
        .insert(vectorData);

    if (error) {
        console.error('Error inserting vectors:', error);
    } else {
        console.log(`Vectors for set ${set} inserted successfully.`);
    }
}

// Check the connection between the frontend and backend
exports.checkStatus = async (req, res) => {
    res.send({ status: 200 })
}

// Generate AI book
exports.generateBook = async (req, res) => {
    const postData = req.body;

    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Api-Key ${process.env.KEYWORDSAI_API_KEY}`
    };
    const fiction_data = {
        messages: [
            { role: "system", content: "Create an intriguing story for a book. The story must have over 5000 words and a conclusion at the end. The story should be tailored to the user's specific requirements, preferences, and themes for their book project. Your goal is to craft a captivating narrative that aligns with the user's vision. Take careful note of any details or guidelines provided by the user to seamlessly integrate the story into their project. It's important to be flexible with adjusting the word count while ensuring the story remains engaging and compelling. The story should be engaging, with well-developed characters and a compelling plot. Please ensure that the generated content is coherent and flows smoothly from chapter to chapter." },
            { role: "user", content: `kind of book : ${postData.kind_of_book}, amount of chapters : ${postData.amount_of_chapters}, title of book : ${postData.book_title}, genre : ${postData.genre}, tone : ${postData.tone}, primary characters : ${postData.primary_characters}, motivation for each characters : ${postData.motivation_for_each_characters}, challenges in story : ${postData.challenges_in_story}, plot notes : ${postData.plot_notes}`}
        ]
    };
    const non_fiction_data = {
        messages: [
            { role: "system", content: "Create an intriguing story for a book. The story must have over 5000 words and a conclusion at the end. The story should be tailored to the user's specific requirements, preferences, and themes for their book project. Your goal is to craft a captivating narrative that aligns with the user's vision. Take careful note of any details or guidelines provided by the user to seamlessly integrate the story into their project. It's important to be flexible with adjusting the word count while ensuring the story remains engaging and compelling. The story should be engaging, with well-developed characters and a compelling plot. Please ensure that the generated content is coherent and flows smoothly from chapter to chapter." },
            { role: "user", content: `kind of book : ${postData.kind_of_book}, amount of chapters : ${postData.amount_of_chapters}, title of book : ${postData.book_title}, genre : ${postData.genre}, tone : ${postData.nonfiction_tone}, themes : ${postData.themes}, subtopics to address : ${postData.subtopics_to_address}, key insights/learnings for the reader : ${postData.key_insights}`}
        ]
    };
    const fictionDataToSave = { kind_of_book: postData.kind_of_book, amount_of_chapters: postData.amount_of_chapters, book_title: postData.book_title, genre: postData.genre, tone: postData.tone, primary_characters: postData.primary_characters, motivation_for_each_characters: postData.motivation_for_each_characters, challenges_in_story: postData.challenges_in_story, plot_notes: postData.plot_notes }
    const nonFictionDataToSave = { kind_of_book: postData.kind_of_book, amount_of_chapters: postData.amount_of_chapters, book_title: postData.book_title, genre: postData.genre, tone: postData.nonfiction_tone, themes: postData.themes, subtopics_to_address: postData.subtopics_to_address, key_insights: postData.key_insights }
    const dataToSave = postData.tone ? fictionDataToSave : nonFictionDataToSave;
    const dataToUse = postData.tone ? fiction_data : non_fiction_data;

    if(postData.tone) {
        insertVectors("fiction", dataToSave);
    }
    else{
        insertVectors("non-fiction", dataToSave);
    }

    console.log("Generating the corresponding story using Keywords AI...");
    // Process the postData and generate the book
    fetch(`${process.env.KEYWORDSAI_URL}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(dataToUse)
    })
    .then(response => response.json())
    .then(data => {
        const generatedStory = data.choices[0]["message"]["content"];
        console.log("Saving the generated story...")
        generatePDF(generatedStory, postData.book_title, postData.primary_characters, postData.plot_notes || postData.key_insights);
        res.status(200).json({ data: generatedStory });
    })
    .catch(error => {
        console.error('Error:', error);
        res.status(500).json({ error: 'Unexpected error caused during generating a story.' });
    }) 
}