import express, { Request, Response } from 'express';
import session, { Session } from 'express-session';

// Define a new interface that extends express-session's Session interface
interface CustomSession extends Session {
    authenticated?: boolean; // Add the authenticated property
    username?: string;
}

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Dummy user data for demonstration
const users = [
    { username: 'user1', password: 'password1' },
    { username: 'user2', password: 'password2' }
];

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: any) => {
    const customSession = req.session as CustomSession; // Cast req.session to CustomSession
    if (customSession && customSession.authenticated) {
        next();
    } else {
        res.redirect('/login');
    }
};

app.get('/', (req: Request, res: Response) => {
  res.render('index');
});

// GET route for login page
app.get('/login', (req: Request, res: Response) => {
    res.render('login');
});

// POST route for handling login form submission
app.post('/login', (req: Request, res: Response) => {
    const { username, password } = req.body;

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        const customSession = req.session as CustomSession; // Cast req.session to CustomSession
        customSession.authenticated = true;
        customSession.username = username; // Store username in session
        res.cookie('sessionId', req.sessionID);
        res.redirect('/dashboard');
    } else {
        res.send('Invalid username or password');
    }
});

// GET route for dashboard (protected route)
app.get('/dashboard', isAuthenticated, (req: Request, res: Response) => {
    const customSession = req.session as CustomSession; // Cast req.session to CustomSession
    res.render('dashboard', { username: customSession.username });
});

// POST route for logout
app.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
      if (err) {
          console.error('Error destroying session:', err);
      } else {
          res.clearCookie('sessionId');
          res.redirect('/login');
      }
  });
});


app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
