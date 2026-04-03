const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const adminEmail = 'admin@tech-mates.com';
const adminPassword = 'owner123';
const adminName = 'Platform Owner';

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Load user model
    const User = require('./src/models/user.model');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with email:', adminEmail);
      console.log('Admin ID:', existingAdmin._id);
      console.log('Admin Role:', existingAdmin.role);
      await mongoose.connection.close();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const adminUser = new User({
      email: adminEmail,
      name: adminName,
      password: hashedPassword,
      role: 'admin',
      username: 'admin',
      avatar: '',
      bio: 'Platform Administrator',
    });

    // Save admin user
    const savedAdmin = await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('   Email:', savedAdmin.email);
    console.log('   Name:', savedAdmin.name);
    console.log('   Role:', savedAdmin.role);
    console.log('   ID:', savedAdmin._id);
    console.log('\n📝 You can now login with:');
    console.log('   Email: ' + adminEmail);
    console.log('   Password: ' + adminPassword);

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdmin();
