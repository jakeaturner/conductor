//
// LibreTexts Conductor
// book.js
// Mongoose Model
//

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookSchema = new Schema({
    bookID: {                   // the LibreTexts standard text identifier of format `libShort-coverPageID`
        type: String,
        required: true,
        unique: true
    },
    title: {                    // the full book title
        type: String,
        required: true
    },
    author: String,             // the book author
    affiliation: String,        // the book author's affiliation
    library: {                  // the book library (standard LibreTexts shortened format)
        type: String,
        required: true
    },
    subject: String,            // the book's shelf/subject
    location: String,           // the book's location in LibreTexts (i.e. Central Bookshelves, Campus Bookshelves, or Learning Objects)
    course: String,             // the course or campus the book belongs to
    program: String,            // the OER program the book is part of
    license: String,            // the book license
    thumbnail: String,          // the URL of the book's thumbnail
    links: {                    // links to access the book in different formats
        online: String,         //      read book online
        pdf: String,            //      download book PDF
        buy: String,            //      view on LibreTexts Bookstore
        zip: String,            //      download ZIP of book pages/files
        files: String,          //      download publication/print files
        lms: String             //      download the LMS import file
    },
    adaptID: String             // the complementary ADAPT course ID (if applicable)
}, {
    timestamps: true
});

BookSchema.index({
    title: 'text',
    author: 'text',
    library: 'text',
    subject: 'text',
    course: 'text',
    license: 'text',
    affiliation: 'text'
});

const Book = mongoose.model('Book', BookSchema);

module.exports = Book;
