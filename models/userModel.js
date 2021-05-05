const crypto = require('crypto')
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: String,
    role: {
        type: String,
        enum: ['user','guide','lead-guide','admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        // This only work on CREATE and SAVE!!!
        validate: {
            validator: function(el) {
                return el === this.password  // passwordConfirm === this.password   =>   return true/false
            },
            message: 'Passwords are not the same!'
        }
    },
    passwordChangedAt : Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
})

userSchema.pre('save', async function(next) {

    // Only run this function if password was actually modified.
    if(!this.isModified('password')) return next()

    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12) 

    // Delete passwordConfirm field
    this.passwordConfirm = undefined;
    next()
})

userSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
})

// Query Middleware (139)
// Delete user
// Veritabanından silmiyoruz ama kullanıcı silinmiş gibi görünüyor.
// Amaç kullanıcı sonradan hesabını aktif ederse diye active'i oluşturduk.
userSchema.pre(/^find/, function(next) {
    // this points to the current query
    this.find({ active: { $ne: false } }); // ilk başta hatalı yaptı active: true dedi böyle yapınca hiç user gelmedi.
    next();
});

// If the given password is the same as the one stored in the document (Instance Method)

userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
        // console.log(changedTimestamp, JWTTimestamp)
        return JWTTimestamp < changedTimestamp 
    }

    // False means NOT changed
    return false;
}

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken =  crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

    console.log({resetToken}, this.passwordResetToken)
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 dakika

    return resetToken;
}

const User = mongoose.model('User', userSchema)

module.exports = User;