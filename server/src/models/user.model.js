const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:[true, "Email is required for creating an user"],
        trim:true,
        lowercase:true,
        match:[/^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/gm, "Please provide a valid email address"],
        unique:[true, "Email already exists, please use a different email address"]
    },
    name:{
        type:String,
        required:[true, "Name is required for creating an user"],
    },
    username: {
        type: String,
        trim: true,
        lowercase: true,
        default: undefined,
        minlength: [3, 'Username must be at least 3 characters long'],
        maxlength: [30, 'Username must be at most 30 characters long'],
        match: [/^[a-z0-9._]+$/, 'Username can only contain lowercase letters, numbers, dots, and underscores'],
        unique: true,
        sparse: true,
    },
    password:{
        type:String,
        required:[true, "Password is required for creating an user"],
        minlength:[6, "Password must be at least 6 characters long"],
        select:false
    },
    refreshToken: {
        type: String,
        default: null,
        select: false,
    },
    role: {
        type: String,
        enum: ['admin', 'developer', 'client'],
        default: 'client',
        required: true,
    },
    avatar: {
        type: String,
        default: '',
    },
    bio: {
        type: String,
        default: '',
    },
    skills: [{
        type: String,
    }],
    location: {
        type: String,
        default: '',
    },
    website: {
        type: String,
        default: '',
    },
    linkedin: {
        type: String,
        default: '',
    },
    instagram: {
        type: String,
        default: '',
    },
    githubUsername: {
        type: String,
        default: '',
    },
    portfolioLinks: [{
        type: String,
    }],
    tier: {
        type: String,
        enum: ['beginner', 'professional', 'elite'],
        default: 'beginner',
    },
    isPro: {
        type: Boolean,
        default: false,
    },
    stripeCustomerId: {
        type: String,
        default: '',
    },
    proSubscriptionId: {
        type: String,
        default: '',
    },
    proExpiresAt: {
        type: Date,
        default: null,
    },
    proGracePeriodEndsAt: {
        type: Date,
        default: null,
    },
    avgRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    totalReviews: {
        type: Number,
        default: 0,
        min: 0,
    },
    walletBalance: {
        type: Number,
        default: 0,
        min: 0,
    },
    totalEarnings: {
        type: Number,
        default: 0,
        min: 0,
    },
    totalSales: {
        type: Number,
        default: 0,
        min: 0,
    },
    totalContractsCompleted: {
        type: Number,
        default: 0,
        min: 0,
    },
    kyc: {
        status: {
            type: String,
            enum: ['pending', 'submitted', 'verified', 'rejected'],
            default: 'pending',
        },
        personalInfo: {
            firstName: String,
            lastName: String,
            dateOfBirth: Date,
            gender: String,
            address: String,
            city: String,
            state: String,
            zipCode: String,
            country: {
                type: String,
                default: 'India',
            },
            phone: String,
        },
        documents: {
            pan: {
                url: String,
                uploadedAt: Date,
            },
            aadhar: {
                url: String,
                uploadedAt: Date,
            },
            selfie: {
                url: String,
                uploadedAt: Date,
            },
            addressProof: {
                url: String,
                uploadedAt: Date,
            },
        },
        rejectionReason: String,
        verifiedAt: Date,
        rejectedAt: Date,
        submittedAt: Date,
    },
    status: {
        type: String,
        enum: ['active', 'banned', 'suspended'],
        default: 'active',
    },
    isBanned: {
        type: Boolean,
        default: false,
    },
    bannedAt: {
        type: Date,
        default: null,
    },
    bannedReason: {
        type: String,
        default: null,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
        default: null,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    verificationBadge: {
        type: String,
        default: '',
    },
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProjectListing',
    }],
    activeProposalCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    
},{
    timestamps:true
});

userSchema.pre('save', async function(){
    if(!this.isModified('password')) { 
        return;
    }
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
});

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.recalculateTier = function () {
    const totalSales = Number(this.totalSales || 0);

    if (totalSales >= 50) {
        this.tier = 'elite';
        return;
    }

    if (totalSales >= 10) {
        this.tier = 'professional';
        return;
    }

    this.tier = 'beginner';
};

userSchema.methods.isProfileComplete = function () {
    const hasUsername = typeof this.username === 'string' && this.username.trim().length >= 3;
    const hasBio = typeof this.bio === 'string' && this.bio.trim().length >= 20;
    const hasSkills = Array.isArray(this.skills) && this.skills.length > 0;
    const hasAvatar = typeof this.avatar === 'string' && this.avatar.trim().length > 0;

    return hasUsername && hasBio && hasSkills && hasAvatar;
};

userSchema.methods.toPublicProfile = function () {
    return {
        _id: this._id,
        name: this.name,
        username: this.username || '',
        role: this.role,
        avatar: this.avatar || '',
        bio: this.bio || '',
        skills: this.skills || [],
        location: this.location || '',
        website: this.website || '',
        linkedin: this.linkedin || '',
        instagram: this.instagram || '',
        githubUsername: this.githubUsername || '',
        portfolioLinks: this.portfolioLinks || [],
        tier: this.tier || 'beginner',
        isPro: Boolean(this.isPro),
        isProfileComplete: this.isProfileComplete(),
        avgRating: Number(this.avgRating || 0),
        totalReviews: Number(this.totalReviews || 0),
        totalContractsCompleted: Number(this.totalContractsCompleted || 0),
        totalSales: Number(this.totalSales || 0),
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
    };
};

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;