import { supabase, supabaseAdmin, TABLES } from '../config/supabase.js';
import jwt from 'jsonwebtoken';

// Verify JWT token and attach user to request
export const authenticateToken = async (req, res, next) => {
  try {
    console.log('Auth middleware called:', {
      path: req.path,
      method: req.method,
      headers: req.headers
    });

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

    // First verify the token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Token verification error:', authError);
      return res.status(401).json({ 
        error: 'Invalid token', 
        details: authError ? authError.message : 'User not found'
      });
    }

    // Get user profile with role information
    console.log('Fetching user profile:', { userId: user.id });
    const { data: profile, error: profileError } = await supabaseAdmin
      .from(TABLES.PROFILES)
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({ 
        error: 'Error fetching user profile', 
        details: profileError.message 
      });
    }

    if (!profile) {
      console.error('Profile not found for user:', user.id);
      return res.status(404).json({ 
        error: 'User profile not found',
        details: 'Please complete your profile setup'
      });
    }

    console.log('User profile found:', { 
      userId: profile.id, 
      role: profile.role 
    });

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
    console.log('Admin check middleware called:', {
      path: req.path,
      method: req.method,
      userId: req.profile?.id,
      role: req.profile?.role
    });

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

    console.log('Admin check passed:', { 
      userId: req.profile.id, 
      role: req.profile.role 
    });
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ 
      error: 'Internal server error in admin check',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 