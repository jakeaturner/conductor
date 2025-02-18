import mongoose from 'mongoose';

const HarvestingRequestSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: 'open'     // request status, one of: ['open', 'converted', 'declined']
    },
    library: {
        type: String,
        required: true
    },
    url: String,
    license: {
        type: String,
        required: true
    },
    name: String,
    institution: String,
    resourceUse: String,
    dateIntegrate: Date,
    comments: String,
    submitter: String,      // user's uuid if submitter was authenticated,
    addToProject: Boolean,   // if user was authenticated, choice to be added to project team upon conversion
    declineReason: String // reason if request was declined by admin
}, {
    timestamps: true
});

const HarvestingRequest = mongoose.model('HarvestingRequest', HarvestingRequestSchema);

export default HarvestingRequest;
