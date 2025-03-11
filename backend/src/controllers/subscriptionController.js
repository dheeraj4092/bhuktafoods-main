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

      const { error: uploadError } = await supabase.storage
        .from('product-images') // Use the existing product-images bucket
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      image_url = publicUrl;
    }

    // Parse arrays if they're strings
    const parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;
    const parsedBenefits = typeof benefits === 'string' ? JSON.parse(benefits) : benefits;
    const parsedRestrictions = typeof restrictions === 'string' ? JSON.parse(restrictions) : restrictions;

    const { data: subscription, error } = await supabase
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

    // Handle image upload
    let image_url = undefined; // undefined means don't update the image_url
    if (req.file) {
      // Get current subscription to delete old image if it exists
      const { data: currentSubscription } = await supabase
        .from('subscriptions')
        .select('image_url')
        .eq('id', id)
        .single();

      if (currentSubscription?.image_url) {
        // Extract the path from the URL
        const oldPath = currentSubscription.image_url.split('/').slice(-2).join('/');
        // Delete old image
        await supabase.storage
          .from('product-images')
          .remove([oldPath]);
      }

      // Upload new image
      const fileExt = path.extname(req.file.originalname);
      const fileName = `subscription-${uuidv4()}${fileExt}`;
      const filePath = `subscriptions/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      image_url = publicUrl;
    }

    // Parse arrays if they're strings
    const parsedFeatures = features ? (typeof features === 'string' ? JSON.parse(features) : features) : undefined;
    const parsedBenefits = benefits ? (typeof benefits === 'string' ? JSON.parse(benefits) : benefits) : undefined;
    const parsedRestrictions = restrictions ? (typeof restrictions === 'string' ? JSON.parse(restrictions) : restrictions) : undefined;

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update({
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        duration_days: duration_days ? parseInt(duration_days) : undefined,
        image_url,
        features: parsedFeatures,
        benefits: parsedBenefits,
        restrictions: parsedRestrictions,
        is_active: is_active === 'true' || is_active === true
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(subscription);
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ 
      error: 'Error updating subscription',
      details: error.message
    });
  }
};

// Delete subscription (admin only)
export const deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    // Get current subscription to delete image if it exists
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('image_url')
      .eq('id', id)
      .single();

    if (subscription?.image_url) {
      // Extract the path from the URL
      const imagePath = subscription.image_url.split('/').slice(-2).join('/');
      // Delete image from storage
      await supabase.storage
        .from('product-images')
        .remove([imagePath]);
    }

    const { error } = await supabase
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

    // Set auth context for RLS policies
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    
    // Get user details from auth
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(user_id);
    if (userError) throw userError;

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
        // If error is duplicate key, try to fetch the profile again
        if (createProfileError.code === '23505') { // Unique violation
          const { data: existingProfile, error: fetchError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', user_id)
            .single();
          
          if (fetchError) throw fetchError;
          if (!existingProfile) throw createProfileError;
        } else {
          console.error('Create profile error:', createProfileError);
          throw createProfileError;
        }
      }
    } else if (profileError) {
      throw profileError;
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
      throw checkError;
    }

    if (existingSubscription) {
      return res.status(400).json({ error: 'User already has an active subscription' });
    }

    // Get subscription details
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('id', subscription_id)
      .single();

    if (subError) throw subError;
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription plan not found' });
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
      throw createError;
    }

    res.status(201).json(userSubscription);
  } catch (error) {
    console.error('Subscribe user error:', error);
    res.status(500).json({ 
      error: 'Error creating subscription',
      details: error.message
    });
  }
};

// Get user's active subscription
export const getUserSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: userSubscription, error } = await supabase
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
        return res.status(404).json({ error: 'No active subscription found' });
      }
      throw error;
    }

    // Check if subscription has expired
    if (userSubscription && new Date(userSubscription.end_date) < new Date()) {
      // Update subscription status to expired
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'expired',
          updated_at: new Date().toISOString()
        })
        .eq('id', userSubscription.id);

      if (updateError) throw updateError;
      return res.status(404).json({ error: 'No active subscription found' });
    }

    res.json(userSubscription);
  } catch (error) {
    console.error('Get user subscription error:', error);
    res.status(500).json({ error: 'Error fetching user subscription' });
  }
};

// Cancel user's subscription
export const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: userSubscription, error } = await supabase
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

    if (error) throw error;
    if (!userSubscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }
    res.json(userSubscription);
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Error cancelling subscription' });
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
    const { pause_until } = req.body;

    const pauseDate = new Date(pause_until);
    if (isNaN(pauseDate.getTime())) {
      return res.status(400).json({ error: 'Invalid pause date' });
    }

    const { data: userSubscription, error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'paused',
        pause_until: pauseDate.toISOString(),
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
    console.error('Pause subscription error:', error);
    res.status(500).json({ error: 'Error pausing subscription' });
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
        pause_until: null,
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