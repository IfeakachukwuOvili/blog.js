
const express = require('express');
const router = express.Router();
const Post = require('../../main-page/public/server/models/Post');
const Contact = require('../../main-page/public/server/models/Contact');
const User = require('../../main-page/public/server/models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminLayout ='layouts/admin';
const jwtSecret = process.env.JWT_SECRET;

/**
 * 
 * Check Login
*/
const authMiddleware = (req, res, next ) => {
  const token = req.cookies.token;

  if(!token) {
    return res.status(401).render('admin/index', {
      layout: adminLayout,
      currentRoute: '/admin',
      message: 'You must be logged in to access this page.'
    });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch(error) {
    res.status(401).render('admin/index', {
  layout: adminLayout,
  currentRoute: '/admin',
  message: 'Your session has expired or is invalid. Please log in again.'
});
  }
}

// Show the admin registration page
router.get('/register', (req, res) => {
    res.render('admin/register', { currentRoute: '/register' });
});

// Admin view: List all contact messages
router.get('/messages', authMiddleware, async (req, res) => {
    try {
        const messages = await Contact.find().sort({ createdAt: -1 });
        res.render('admin/messages', {
            messages,
            layout: 'layouts/admin',
            currentRoute: '/messages',
            deleted: req.query.deleted
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Could not retrieve messages');
    }
});

// Preview a single post in the CMS
router.get('/post/:id', async (req, res) => {
    try {
        let slug = req.params.id;
        const data = await Post.findById({ _id: slug });
        const locals = {
            title: data ? data.title : 'Post Not Found',
            description: "Simple Blog created with NodeJs, Express & MongoDb.",
        };
        if (!data) {
            return res.status(404).render('admin/not-found', { locals, layout: 'layouts/admin', currentRoute: '/admin' });
        }
        res.render('admin/post', {
            locals,
            data,
            currentRoute: `/post/${slug}`,
            layout: 'layouts/admin'
        });
    } catch (error) {
        console.log(error);
        res.status(404).render('admin/not-found', { locals: { title: 'Not Found' }, layout: 'layouts/admin', currentRoute: '/admin' });
    }
});




/**
 * GET/
 * Admin- Login Page
 */
router.get('/admin', async(req, res) => { 
    try{
        const locals ={
            title: "Admin",
            description: "Simple Blog Created with NodeJS, Express & MongoDB"
        }

        res.render('admin/index', {locals, layout: adminLayout, currentRoute: '/admin'});
    } catch(error){
        console.log(error);
    }
});


/**
 * POST /
 * Admin - Check Login
*/

router.post('/admin', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await User.findOne( { username } );
  
      if(!user) {
        return res.status(401).json( { message: 'Invalid credentials' } );
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if(!isPasswordValid) {
        return res.status(401).json( { message: 'Invalid credentials' } );
      }
  
      const token = jwt.sign({ userId: user._id}, jwtSecret );
      res.cookie('token', token, { httpOnly: true });
      res.redirect('/dashboard');
  
    } catch (error) {
      console.log(error);
    }
  });

/**
 * POST /
 * Admin - Register
*/
router.post('/register', async (req, res) => {
    try {
      const { username, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds
  
      try {
        const user = await User.create({ username, password:hashedPassword });
        res.status(201).json({ message: 'User Created', user });
      } catch (error) {
        if(error.code === 11000) {
          res.status(409).json({ message: 'User already in use'});
        }
        res.status(500).json({ message: 'Internal server error'})
      }
  
    } catch (error) {
      console.log(error);
    }
  });


  
/**
 * GET /
 * Admin Dashboard
*/
router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
      const locals = {
        title: 'Dashboard',
        description: 'Simple Blog created with NodeJs, Express & MongoDb.'
      }
  
      const data = await Post.find();
      res.render('admin/dashboard', {
        locals,
        data,
        layout: adminLayout,
        currentRoute: '/dashboard'
      });
  
    } catch (error) {
      console.log(error);
    }
  
  });


  /**
 * GET /
 * Admin - Create New Post (gets post)
*/
router.get('/add-post', authMiddleware, async (req, res) => {
    try {
      const locals = {
        title: 'Add Post',
        description: 'Simple Blog created with NodeJs, Express & MongoDb.'
      }
  
      const data = await Post.find();
      res.render('admin/add-post', {
        locals,
        layout: adminLayout,
        currentRoute: '/add-post'
      });
  
    } catch (error) {
      console.log(error);
    }
  
  });

  /**
 * POST /
 * Admin - Create New Post (adds post)
*/
router.post('/add-post', authMiddleware, async (req, res) => {
    try {
      try {
        const newPost = new Post({
          title: req.body.title,
          body: req.body.body
        });
  
        await Post.create(newPost);
        res.redirect('/dashboard');
      } catch (error) {
        console.log(error);
      }
  
    } catch (error) {
      console.log(error);
    }
  });


    
  /**
   * PUT /
   * Admin - Create New Post (updates the post)
  */
  router.put('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
  
      await Post.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        body: req.body.body,
        updatedAt: Date.now()
      });
  
      res.redirect(`/edit-post/${req.params.id}`);
  
    } catch (error) {
      console.log(error);
    }
  
  });


  /**
 * GET /
 * Admin - Create New Post (saves the editted post)
*/
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
  
      const locals = {
        title: "Edit Post",
        description: "Free NodeJs User Management System",
      };
  
      const data = await Post.findOne({ _id: req.params.id });
  
      res.render('admin/edit-post', {
        locals,
        data,
        layout: adminLayout,
        currentRoute: '/edit-post/' + req.params.id
      })
  
    } catch (error) {
      console.log(error);
    }
  
  });
  
  /**
 * DELETE /
 * Admin - Delete Post
*/
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {

    try {
      await Post.deleteOne( { _id: req.params.id } );
      res.redirect('/dashboard');
    } catch (error) {
      console.log(error);
    }
  
  });
  
  
  /**
   * GET /
   * Admin Logout
  */
  router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/admin');
});
  

// Fallback: render admin index at '/'
router.get('/', (req, res) => {
    res.render('admin/index', { layout: adminLayout, currentRoute: '/admin' });
});

// Delete a contact message
router.post('/delete-message/:id', authMiddleware, async (req, res) => {
    try {
        await Contact.findByIdAndDelete(req.params.id);
        // Redirect back to /messages with a success message
        res.redirect('/messages?deleted=1');
    } catch (error) {
        console.log(error);
        res.redirect('/messages?deleted=0');
    }
});

module.exports = router;