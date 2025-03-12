import { supabase, supabaseAdmin, TABLES } from '../config/supabase.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

// Verify JWT token and attach user to request
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('Missing authorization header');
      return res.status(401).json({ error: 'Authentication required', details: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('No token in authorization header');
      return res.status(401).json({ error: 'Authentication required', details: 'No token provided' });
    }

    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ error: 'Server configuration error', details: 'Missing JWT configuration' });
    }

    // Verify JWT token
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      console.error('JWT verification error:', error);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired', details: 'Please log in again' });
      }
      return res.status(401).json({ error: 'Invalid token', details: error.message });
    }

    // Get user profile with role information
    const { data: profile, error: profileError } = await supabaseAdmin
      .from(TABLES.PROFILES)
      .select('*')
      .eq('id', decodedToken.userId)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({ 
        error: 'Error fetching user profile', 
        details: profileError.message 
      });
    }

    if (!profile) {
      console.error('Profile not found for user:', decodedToken.userId);
      return res.status(404).json({ 
        error: 'User profile not found',
        details: 'Please complete your profile setup'
      });
    }

    // Get user from Supabase using admin client
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(decodedToken.userId);
    
    if (userError || !user) {
      console.error('User fetch error:', userError);
      return res.status(401).json({ 
        error: 'User not found', 
        details: userError ? userError.message : 'User account may have been deleted'
      });
    }

    // Attach user and profile to request
    req.user = user;
    req.profile = profile;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      error: 'Internal server error in auth middleware',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Check if user is admin
export const isAdmin = async (req, res, next) => {
  try {
    if (!req.profile) {
      console.error('No user profile in request');
      return res.status(401).json({ 
        error: 'No user profile found',
        details: 'Authentication required'
      });
    }

    if (req.profile.role !== 'admin') {
      console.error(`User ${req.profile.id} attempted admin access with role ${req.profile.role}`);
      return res.status(403).json({ 
        error: 'Admin access required',
        details: 'Your account does not have administrative privileges'
      });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ 
      error: 'Internal server error in admin check',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 