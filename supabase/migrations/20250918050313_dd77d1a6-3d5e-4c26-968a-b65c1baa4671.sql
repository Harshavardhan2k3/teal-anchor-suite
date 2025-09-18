-- Enable Row Level Security on all public tables
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_schedules ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to get current user's employee ID
CREATE OR REPLACE FUNCTION public.get_current_user_emp_id()
RETURNS TEXT AS $$
  SELECT emp_id FROM public.user_profiles 
  WHERE id = auth.uid()
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create another function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
  SELECT role = 'admin' FROM public.user_profiles 
  WHERE id = auth.uid()
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Policies for attendance_records table
CREATE POLICY "Users can view their own attendance records" 
ON public.attendance_records 
FOR SELECT 
USING (emp_id = public.get_current_user_emp_id() OR public.is_current_user_admin());

CREATE POLICY "Users can insert their own attendance records" 
ON public.attendance_records 
FOR INSERT 
WITH CHECK (emp_id = public.get_current_user_emp_id());

CREATE POLICY "Users can update their own attendance records" 
ON public.attendance_records 
FOR UPDATE 
USING (emp_id = public.get_current_user_emp_id() OR public.is_current_user_admin());

-- Policies for leave_balances table
CREATE POLICY "Users can view their own leave balance" 
ON public.leave_balances 
FOR SELECT 
USING (emp_id = public.get_current_user_emp_id() OR public.is_current_user_admin());

CREATE POLICY "System can manage leave balances" 
ON public.leave_balances 
FOR ALL 
USING (public.is_current_user_admin());

-- Policies for leave_requests table
CREATE POLICY "Users can view their own leave requests" 
ON public.leave_requests 
FOR SELECT 
USING (emp_id = public.get_current_user_emp_id() OR public.is_current_user_admin());

CREATE POLICY "Users can create their own leave requests" 
ON public.leave_requests 
FOR INSERT 
WITH CHECK (emp_id = public.get_current_user_emp_id());

CREATE POLICY "Users can update their own pending leave requests" 
ON public.leave_requests 
FOR UPDATE 
USING (emp_id = public.get_current_user_emp_id() AND status = 'pending');

CREATE POLICY "Admins can update any leave request" 
ON public.leave_requests 
FOR UPDATE 
USING (public.is_current_user_admin());

-- Policies for notifications table
CREATE POLICY "Users can view their own notifications or all notifications if emp_id is null" 
ON public.notifications 
FOR SELECT 
USING (emp_id IS NULL OR emp_id = public.get_current_user_emp_id() OR public.is_current_user_admin());

CREATE POLICY "Admins can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (public.is_current_user_admin());

-- Policies for user_profiles table
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (id = auth.uid() OR public.is_current_user_admin());

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles" 
ON public.user_profiles 
FOR SELECT 
USING (public.is_current_user_admin());

CREATE POLICY "Admins can create profiles" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (public.is_current_user_admin());

-- Policies for work_schedules table
CREATE POLICY "Users can view their own work schedule" 
ON public.work_schedules 
FOR SELECT 
USING (emp_id = public.get_current_user_emp_id() OR public.is_current_user_admin());

CREATE POLICY "Admins can manage work schedules" 
ON public.work_schedules 
FOR ALL 
USING (public.is_current_user_admin());

-- Fix the existing function's search path
CREATE OR REPLACE FUNCTION public.create_leave_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
begin
    insert into leave_balances(emp_id)
    values (new.emp_id);
    return new;
end;
$function$;