

// @desc Update user
// @route PUT /api/user:id
// @access Private




// @desc delete user
// @route PUT /api/user:id
// @access Private

// export const getCurrentUser = async (req, res, next) => {
//     const {id} = req.user;
//     console.log('user in getCurrentUser: ', req.user);
//   try {
//     const { email, first_name, verified } = await User.findById(id);
//     if (!user) {
//       return res.status(400).json({
//         message: "Account does not exists.",
//       });
//     }
//     return res.status(200).json({
//       email: user.email,
//       picture: user.picture,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const getUsers = async (req, res, next) => {
//     console.log('req.body in getUsers', req.body);
  
//     try {
//       const users = await User.find();
  
//       console.log('users', users);
//       res.status(200).json(users);
//     } catch (error) {
//       return next(error);
//     }
//   };