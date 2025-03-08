
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { User, Mail, Lock, CheckCircle, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 characters"),
});

export const SignupModal = ({ isOpen, onClose, onSwitchToLogin }: SignupModalProps) => {
  const { toast } = useToast();
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const checkUsernameExists = async (username: string) => {
    try {
      const { data, error } = await supabase
        .rpc('check_username_exists', { username_to_check: username });
      
      if (error) {
        console.error('Error checking username:', error);
        return false;
      }
      
      return data === true;
    } catch (err) {
      console.error('Exception checking username:', err);
      return false;
    }
  };

  const checkEmailExists = async (email: string) => {
    try {
      const { data, error } = await supabase
        .rpc('check_email_exists', { email_to_check: email });
      
      if (error) {
        console.error('Error checking email:', error);
        return false;
      }
      
      return data === true;
    } catch (err) {
      console.error('Exception checking email:', err);
      return false;
    }
  };

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const usernameExists = await checkUsernameExists(values.username);
      if (usernameExists) {
        toast({
          title: "Username already taken",
          description: "Please choose a different username",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const emailExists = await checkEmailExists(values.email);
      if (emailExists) {
        toast({
          title: "Email already registered",
          description: "Please use a different email or sign in",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Send OTP to email and go to OTP verification step
      const { error } = await supabase.auth.signInWithOtp({
        email: values.email,
        options: {
          shouldCreateUser: false,
        }
      });

      if (error) throw error;

      setEmail(values.email);
      setStep(3); // Move to OTP verification step
      toast({
        title: "Verification code sent",
        description: "Please check your email for the 6-digit code",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during signup",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (values: z.infer<typeof otpSchema>) => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Verify OTP
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: values.otp,
        type: 'email',
      });

      if (error) throw error;
      
      // If OTP verified, create the user account
      const formValues = form.getValues();
      await signUp(formValues.email, formValues.password, formValues.username);
      
      toast({
        title: "Account Created",
        description: "Your account has been created successfully",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = async () => {
    const emailValue = form.getValues("email");
    const usernameValue = form.getValues("username");
    
    const emailResult = await form.trigger("email");
    const usernameResult = await form.trigger("username");
    
    if (emailResult && usernameResult) {
      const usernameExists = await checkUsernameExists(usernameValue);
      if (usernameExists) {
        form.setError("username", { 
          message: "Username already taken" 
        });
        return;
      }

      const emailExists = await checkEmailExists(emailValue);
      if (emailExists) {
        form.setError("email", { 
          message: "Email already registered" 
        });
        return;
      }
      
      setStep(2);
      form.setValue("password", "");
    }
  };

  const resendOtp = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        }
      });

      if (error) throw error;

      toast({
        title: "Code Resent",
        description: "A new verification code has been sent to your email",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred when resending code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden bg-white dark:bg-gray-950 rounded-xl">
        <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {step === 1 ? "Create Your Account" : step === 2 ? "Set a Password" : "Verify Your Email"}
            </DialogTitle>
          </DialogHeader>

          {step < 3 ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-6">
                {step === 1 ? (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-5"
                  >
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Username
                          </FormLabel>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <FormControl>
                              <Input
                                {...field}
                                className="pl-10 h-12 border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900"
                                placeholder="Choose a unique username"
                              />
                            </FormControl>
                          </div>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email
                          </FormLabel>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                className="pl-10 h-12 border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900"
                                placeholder="Your email address"
                              />
                            </FormControl>
                          </div>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={isLoading}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:opacity-90 text-white font-medium rounded-lg"
                    >
                      Continue
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-5"
                  >
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <p>Account details confirmed! Now set a password.</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Password
                          </FormLabel>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                className="pl-10 h-12 border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900"
                                placeholder="Create a secure password"
                              />
                            </FormControl>
                          </div>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />

                    <div className="flex flex-col gap-3">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:opacity-90 text-white font-medium rounded-lg"
                      >
                        {isLoading ? "Sending verification..." : "Continue to Verification"}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="w-full h-12 border-gray-200 dark:border-gray-800 rounded-lg"
                      >
                        Back
                      </Button>
                    </div>
                  </motion.div>
                )}

                <div className="text-center space-y-2 pt-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={onSwitchToLogin}
                      className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                    >
                      Sign in
                    </button>
                  </div>
                </div>
              </form>
            </Form>
          ) : (
            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(verifyOtp)} className="space-y-5 mt-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-5"
                >
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <p>We've sent a verification code to <span className="font-medium">{email}</span></p>
                  </div>

                  <FormField
                    control={otpForm.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem className="space-y-5">
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <KeyRound className="h-4 w-4" />
                          Verification Code
                        </FormLabel>
                        <FormControl>
                          <InputOTP maxLength={6} {...field}>
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </FormControl>
                        <FormMessage className="text-xs text-red-500" />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col gap-3">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:opacity-90 text-white font-medium rounded-lg"
                    >
                      {isLoading ? "Verifying..." : "Create Account"}
                    </Button>
                    
                    <div className="text-center text-sm">
                      <button
                        type="button"
                        onClick={resendOtp}
                        disabled={isLoading}
                        className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
                      >
                        Didn't receive a code? Resend
                      </button>
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="w-full h-12 border-gray-200 dark:border-gray-800 rounded-lg"
                    >
                      Back
                    </Button>
                  </div>
                </motion.div>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
