import { supabase, supabaseAdmin } from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Get all subscriptions
export const getSubscriptions = async (req, res) => {
  try {
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (error) throw error;
    res.json(subscriptions);
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ error: 'Error fetching subscriptions' });
  }
};

// Get subscription by ID
export const getSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    res.json(subscription);
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Error fetching subscription' });
  }
};

// Create subscription (admin only)
export const createSubscription = async (req, res) => {
  try {
    // Validate required fields
    const requiredFields = ['name', 'description', 'price', 'duration_days'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}`,
        receivedData: req.body
      });
    }

    const {
      name,
      description,
      price,
      duration_days,
      features = '[]',
      benefits = '[]',
      restrictions = '[]',
      is_active = true
    } = req.body;

    // Handle image upload
    let image_url = null;
    if (req.file) {
      // Upload image to Supabase Storage
      const fileExt = path.extname(req.file.originalname);
      const fileName = `subscription-${uuidv4()}${fileExt}`;
      const filePath = `subscriptions/${fileName}`; // Store in a subscriptions subfolder

      const { error: uploadError } = await supabaseAdmin.storage
        .from('product-images') // Use the existing product-images bucket
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('product-images')
        .getPublicUrl(filePath);

      image_url = publicUrl;
    }

    // Parse arrays if they're strings
    const parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;
    const parsedBenefits = typeof benefits === 'string' ? JSON.parse(benefits) : benefits;
    const parsedRestrictions = typeof restrictions === 'string' ? JSON.parse(restrictions) : restrictions;

    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .insert([
        {
          name,
          description,
          price: parseFloat(price),
          duration_days: parseInt(duration_days),
          image_url,
          features: parsedFeatures,
          benefits: parsedBenefits,
          restrictions: parsedRestrictions,
          is_active: is_active === 'true' || is_active === true
        }
      ])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(subscription);
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ 
      error: 'Error creating subscription',
      details: error.message,
      receivedData: req.body
    });
  }
};

// Update subscription (admin only)
export const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      duration_days,
      features,
      benefits,
      restrictions,
      is_active
    } = req.body;

    // First check if subscription exists
    const { data: existingSubscription, error: checkError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError) {
      console.error('Error checking subscription:', checkError);
      return res.status(500).json({
        error: 'Database error',
        message: 'Error checking subscription existence',
        code: 'DB_ERROR'
      });
    }

    if (!existingSubscription) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Subscription not found',
        code: 'SUBSCRIPTION_NOT_FOUND'
      });
    }

    // Validate required fields
    if (!name || !description || !price || !duration_days) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Name, description, price, and duration are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Handle image upload
    let image_url = undefined;
    if (req.file) {
      try {
        // Delete old image if it exists
        if (existingSubscription.image_url) {
          const oldPath = existingSubscription.image_url.split('/').slice(-2).join('/');
          await supabaseAdmin.storage
            .from('product-images')
            .remove([oldPath]);
        }

        // Upload new image
        const fileExt = path.extname(req.file.originalname);
        const fileName = `subscription-${uuidv4()}${fileExt}`;
        const filePath = `subscriptions/${fileName}`;

        const { error: uploadError } = await supabaseAdmin.storage
          .from('product-images')
          .upload(filePath, req.file.buffer, {
            contentType: req.file.mimetype,
            cacheControl: '3600'
          });

        if (uploadError) {
          console.error('Image upload error:', uploadError);
          return res.status(500).json({
            error: 'Upload failed',
            message: 'Failed to upload image',
            code: 'IMAGE_UPLOAD_ERROR'
          });
        }

        // Get public URL
        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('product-images')
          .getPublicUrl(filePath);

        image_url = publicUrl;
      } catch (uploadError) {
        console.error('Error handling image:', uploadError);
        return res.status(500).json({
          error: 'Upload failed',
          message: 'Failed to process image',
          code: 'IMAGE_PROCESSING_ERROR'
        });
      }
    }

    // Parse arrays if they're strings
    const parsedFeatures = features ? (typeof features === 'string' ? JSON.parse(features) : features) : existingSubscription.features;
    const parsedBenefits = benefits ? (typeof benefits === 'string' ? JSON.parse(benefits) : benefits) : existingSubscription.benefits;
    const parsedRestrictions = restrictions ? (typeof restrictions === 'string' ? JSON.parse(restrictions) : restrictions) : existingSubscription.restrictions;

    // Prepare update data
    const updateData = {
      name,
      description,
      price: parseFloat(price),
      duration_days: parseInt(duration_days),
      features: parsedFeatures,
      benefits: parsedBenefits,
      restrictions: parsedRestrictions,
      updated_at: new Date().toISOString()
    };

    // Only update image_url if we have a new one
    if (image_url !== undefined) {
      updateData.image_url = image_url;
    }

    // Only update is_active if it's provided
    if (is_active !== undefined) {
      updateData.is_active = is_active === 'true' || is_active === true;
    }

    // Update subscription
    const { data: subscription, error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return res.status(500).json({
        error: 'Update failed',
        message: updateError.message,
        code: 'UPDATE_ERROR'
      });
    }

    if (!subscription) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Subscription not found after update',
        code: 'UPDATE_RESULT_NOT_FOUND'
      });
    }

    console.log('Subscription updated successfully:', subscription);
    res.json(subscription);
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Error updating subscription',
      code: 'SERVER_ERROR',
      details: error.message
    });
  }
};

// Delete subscription (admin only)
export const deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    // Get current subscription to delete image if it exists
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('image_url')
      .eq('id', id)
      .single();

    if (subscription?.image_url) {
      // Extract the path from the URL
      const imagePath = subscription.image_url.split('/').slice(-2).join('/');
      // Delete image from storage
      await supabaseAdmin.storage
        .from('product-images')
        .remove([imagePath]);
    }

    const { error } = await supabaseAdmin
      .from('subscriptions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    console.error('Delete subscription error:', error);
    res.status(500).json({ 
      error: 'Error deleting subscription',
      details: error.message
    });
  }
};

// Subscribe user to a plan
export const subscribeUser = async (req, res) => {
  try {
    const { subscription_id } = req.body;
    const user_id = req.user.id;

    // Validate subscription_id format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!subscription_id || !uuidRegex.test(subscription_id)) {
      return res.status(400).json({ 
        error: 'Invalid subscription ID format',
        message: 'Please provide a valid subscription ID'
      });
    }

    // Set auth context for RLS policies
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    
    // Get user details from auth
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(user_id);
    if (userError) {
      console.error('User auth error:', userError);
      return res.status(500).json({ 
        error: 'Authentication error',
        message: 'Failed to verify user'
      });
    }

    // Check if user profile exists, if not create it
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single();

    if (profileError && profileError.code === 'PGRST116') {
      // Profile doesn't exist, create it
      const { data: newProfile, error: createProfileError } = await supabaseAdmin
        .from('profiles')
        .insert([
          {
            id: user_id,
            email: user.email,
            role: 'customer',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (createProfileError) {
        console.error('Create profile error:', createProfileError);
        return res.status(500).json({ 
          error: 'Profile creation failed',
          message: 'Failed to create user profile'
        });
      }
    } else if (profileError) {
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({ 
        error: 'Profile fetch failed',
        message: 'Failed to fetch user profile'
      });
    }

    // Set the auth context for subsequent operations
    await supabaseAdmin.auth.setSession({
      access_token: token,
      refresh_token: ''
    });

    // Check if user already has an active subscription
    const { data: existingSubscription, error: checkError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user_id)
      .eq('status', 'active')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Subscription check error:', checkError);
      return res.status(500).json({ 
        error: 'Subscription check failed',
        message: 'Failed to check existing subscriptions'
      });
    }

    if (existingSubscription) {
      return res.status(400).json({ 
        error: 'Active subscription exists',
        message: 'User already has an active subscription'
      });
    }

    // Get subscription details
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('id', subscription_id)
      .single();

    if (subError) {
      console.error('Subscription fetch error:', subError);
      return res.status(500).json({ 
        error: 'Subscription fetch failed',
        message: 'Failed to fetch subscription details'
      });
    }

    if (!subscription) {
      return res.status(404).json({ 
        error: 'Subscription not found',
        message: 'The requested subscription plan does not exist'
      });
    }

    // Calculate start and end dates
    const start_date = new Date();
    const end_date = new Date(start_date);
    end_date.setDate(end_date.getDate() + subscription.duration_days);

    // Create user subscription using admin client
    const { data: userSubscription, error: createError } = await supabaseAdmin
      .from('user_subscriptions')
      .insert([
        {
          user_id,
          subscription_id,
          start_date: start_date.toISOString(),
          end_date: end_date.toISOString(),
          status: 'active',
          auto_renew: false
        }
      ])
      .select('*, subscription:subscriptions(*)')
      .single();

    if (createError) {
      console.error('Create subscription error:', createError);
      return res.status(500).json({ 
        error: 'Subscription creation failed',
        message: 'Failed to create user subscription'
      });
    }

    res.status(201).json(userSubscription);
  } catch (error) {
    console.error('Subscribe user error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing your subscription'
    });
  }
};

// Get user's active subscription
export const getUserSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's active subscription using admin client
    const { data: userSubscription, error } = await supabaseAdmin
      .from('user_subscriptions')
      .select(`
        *,
        subscription:subscriptions(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          error: 'Not found',
          message: 'No active subscription found'
        });
      }
      console.error('Error fetching user subscription:', error);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Failed to fetch user subscription'
      });
    }

    // Check if subscription has expired
    if (userSubscription && new Date(userSubscription.end_date) < new Date()) {
      // Update subscription status to expired
      const { error: updateError } = await supabaseAdmin
        .from('user_subscriptions')
        .update({
          status: 'expired',
          updated_at: new Date().toISOString()
        })
        .eq('id', userSubscription.id);

      if (updateError) {
        console.error('Error updating expired subscription:', updateError);
        return res.status(500).json({ 
          error: 'Update error',
          message: 'Failed to update expired subscription'
        });
      }
      return res.status(404).json({ 
        error: 'Not found',
        message: 'No active subscription found'
      });
    }

    res.json(userSubscription);
  } catch (error) {
    console.error('Get user subscription error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred while fetching your subscription'
    });
  }
};

// Cancel user's subscription
export const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // First check if user has an active subscription
    const { data: existingSubscription, error: checkError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (checkError) {
      console.error('Error checking subscription:', checkError);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Error checking subscription status'
      });
    }

    if (!existingSubscription) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'No active subscription found to cancel'
      });
    }

    // Update the subscription status
    const { data: userSubscription, error: updateError } = await supabaseAdmin
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        auto_renew: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('status', 'active')
      .select(`
        *,
        subscription:subscriptions(*)
      `)
      .single();

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      return res.status(500).json({ 
        error: 'Update failed',
        message: 'Failed to cancel subscription'
      });
    }

    if (!userSubscription) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Subscription not found after update'
      });
    }

    res.json(userSubscription);
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred while cancelling your subscription'
    });
  }
};

// Toggle auto-renewal for user's subscription
export const toggleAutoRenewal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { auto_renew } = req.body;

    const { data: userSubscription, error } = await supabase
      .from('user_subscriptions')
      .update({
        auto_renew: auto_renew,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('status', 'active')
      .select()
      .single();

    if (error) throw error;
    if (!userSubscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }
    res.json(userSubscription);
  } catch (error) {
    console.error('Toggle auto-renewal error:', error);
    res.status(500).json({ error: 'Error updating auto-renewal setting' });
  }
};

// Renew user's subscription
export const renewSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get current subscription
    const { data: currentSubscription, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select('*, subscription:subscriptions(*)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (fetchError) throw fetchError;
    if (!currentSubscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Calculate new dates
    const startDate = new Date(currentSubscription.end_date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + currentSubscription.subscription.duration_days);

    // Create new subscription period
    const { data: newSubscription, error: renewError } = await supabase
      .from('user_subscriptions')
      .insert([
        {
          user_id: userId,
          subscription_id: currentSubscription.subscription_id,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: 'active',
          auto_renew: currentSubscription.auto_renew
        }
      ])
      .select()
      .single();

    if (renewError) throw renewError;
    res.status(201).json(newSubscription);
  } catch (error) {
    console.error('Renew subscription error:', error);
    res.status(500).json({ error: 'Error renewing subscription' });
  }
};

// Change subscription plan
export const changeSubscriptionPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { new_subscription_id } = req.body;

    // Get new subscription details
    const { data: newSubscriptionPlan, error: planError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', new_subscription_id)
      .single();

    if (planError) throw planError;
    if (!newSubscriptionPlan) {
      return res.status(404).json({ error: 'New subscription plan not found' });
    }

    // Cancel current subscription
    const { error: cancelError } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('status', 'active');

    if (cancelError) throw cancelError;

    // Create new subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + newSubscriptionPlan.duration_days);

    const { data: newSubscription, error: createError } = await supabase
      .from('user_subscriptions')
      .insert([
        {
          user_id: userId,
          subscription_id: new_subscription_id,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: 'active'
        }
      ])
      .select()
      .single();

    if (createError) throw createError;
    res.status(201).json(newSubscription);
  } catch (error) {
    console.error('Change subscription plan error:', error);
    res.status(500).json({ error: 'Error changing subscription plan' });
  }
};

// Pause subscription
export const pauseSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pause_end } = req.body;

    const pauseEndDate = new Date(pause_end);
    if (isNaN(pauseEndDate.getTime())) {
      return res.status(400).json({ error: 'Invalid pause date' });
    }

    const pauseStartDate = new Date();

    const { data: userSubscription, error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'paused',
        pause_start: pauseStartDate.toISOString(),
        pause_end: pauseEndDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('status', 'active')
      .select(`
        *,
        subscription:subscriptions(*)
      `)
      .single();

    if (error) {
      console.error('Pause subscription error:', error);
      return res.status(500).json({ 
        error: 'Database error',
        message: error.message 
      });
    }

    if (!userSubscription) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'No active subscription found to pause'
      });
    }

    res.json(userSubscription);
  } catch (error) {
    console.error('Pause subscription error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred while pausing your subscription'
    });
  }
};

// Resume subscription
export const resumeSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: userSubscription, error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'active',
        pause_end: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('status', 'paused')
      .select()
      .single();

    if (error) throw error;
    if (!userSubscription) {
      return res.status(404).json({ error: 'No paused subscription found' });
    }
    res.json(userSubscription);
  } catch (error) {
    console.error('Resume subscription error:', error);
    res.status(500).json({ error: 'Error resuming subscription' });
  }
};

// Get subscription history for a user
export const getSubscriptionHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: history, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription:subscriptions(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(history);
  } catch (error) {
    console.error('Get subscription history error:', error);
    res.status(500).json({ error: 'Error fetching subscription history' });
  }
};

// Get subscription analytics for a user
export const getSubscriptionAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: analytics, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription:subscriptions(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate analytics
    const totalSubscriptions = analytics.length;
    const activeSubscriptions = analytics.filter(sub => sub.status === 'active').length;
    const cancelledSubscriptions = analytics.filter(sub => sub.status === 'cancelled').length;
    const pausedSubscriptions = analytics.filter(sub => sub.status === 'paused').length;

    const analyticsData = {
      totalSubscriptions,
      activeSubscriptions,
      cancelledSubscriptions,
      pausedSubscriptions,
      history: analytics
    };

    res.json(analyticsData);
  } catch (error) {
    console.error('Get subscription analytics error:', error);
    res.status(500).json({ error: 'Error fetching subscription analytics' });
  }
}; 