import User from '../models/User.js';
import Article from '../models/Article.js';
import Activity from '../models/Activity.js';

/**
 * @desc    Get all users with article counts
 * @route   GET /api/users
 * @access  Private (Admin or Knowledge Owner for owner selection dropdown)
 */
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });

    // Aggregate article counts per user
    const articleCounts = await Article.aggregate([
      {
        $group: {
          _id: '$owner',
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = {};
    articleCounts.forEach((item) => {
      if (item._id) {
        countMap[item._id.toString()] = item.count;
      }
    });

    const enrichedUsers = users.map((user) => {
      const u = user.toObject();
      u.articlesOwned = countMap[u._id.toString()] || 0;
      return u;
    });

    res.json({
      success: true,
      data: enrichedUsers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch users',
    });
  }
};

/**
 * @desc    Create a new user (by Admin)
 * @route   POST /api/users
 * @access  Private (Admin only)
 */
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: password || 'Welcome@123',
      role: role || 'Knowledge Owner',
      department: department || 'Operations',
      status: 'active',
    });

    await Activity.create({
      user: req.user._id,
      action: 'user_created',
      details: `${req.user.name} added new user ${user.name} (${user.role})`,
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status,
        articlesOwned: 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create user',
    });
  }
};

/**
 * @desc    Update user details, role or status
 * @route   PUT /api/users/:id
 * @access  Private (Admin only)
 */
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const { name, role, department, status, password } = req.body;

    if (name) user.name = name;
    if (role && ['Admin', 'Knowledge Owner', 'Viewer'].includes(role)) {
      user.role = role;
    }
    if (department) user.department = department;
    if (status && ['active', 'disabled'].includes(status)) {
      user.status = status;
    }
    if (password && password.length >= 6) {
      user.password = password;
    }

    await user.save();

    await Activity.create({
      user: req.user._id,
      action: 'role_updated',
      details: `${req.user.name} updated account for ${user.name} (Role: ${user.role}, Status: ${user.status})`,
    });

    const articlesOwned = await Article.countDocuments({ owner: user._id });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status,
        articlesOwned,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update user',
    });
  }
};

/**
 * @desc    Delete user or deactivate
 * @route   DELETE /api/users/:id
 * @access  Private (Admin only)
 */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account.',
      });
    }

    const name = user.name;
    await User.findByIdAndDelete(user._id);

    await Activity.create({
      user: req.user._id,
      action: 'user_created',
      details: `${req.user.name} deleted user ${name}`,
    });

    res.json({
      success: true,
      message: `User ${name} removed successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete user',
    });
  }
};
