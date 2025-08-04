import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FlowStepWithFields, FieldValues } from '@/types/leadFlow';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Mail, Phone, MapPin, ArrowRight, Sparkles, Home } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ThankYouStepProps {
  step: FlowStepWithFields;
  responses: FieldValues;
  styleConfig?: any;
}

export default function ThankYouStep({ step, responses, styleConfig }: ThankYouStepProps) {
  const navigate = useNavigate();
  const [showResults, setShowResults] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  useEffect(() => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Show results after a delay
    setTimeout(() => setShowResults(true), 1000);

    // Handle redirect if configured
    if (step.redirect_url) {
      const delay = step.redirect_delay || 3;
      setRedirectCountdown(delay);
      
      const countdownInterval = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownInterval);
            // Check if it's an internal or external URL
            if (step.redirect_url!.startsWith('/')) {
              navigate(step.redirect_url!);
            } else if (step.redirect_url!.startsWith('http')) {
              window.location.href = step.redirect_url!;
            } else {
              // Assume it's an internal route without leading slash
              navigate(`/${step.redirect_url}`);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [step.redirect_url, step.redirect_delay, navigate]);

  const handleViewListings = () => {
    // Navigate to search with pre-filled location
    const searchParams = new URLSearchParams();
    if (responses.zipCode || responses.zip_code || responses.zip) {
      searchParams.set('zip', responses.zipCode || responses.zip_code || responses.zip);
    }
    navigate(`/section8?${searchParams.toString()}`);
  };

  return (
    <div className="space-y-8">
      {/* Success animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="flex justify-center"
      >
        <div className="relative">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute -right-2 -top-2"
          >
            <Sparkles className="w-8 h-8 text-yellow-500" />
          </motion.div>
        </div>
      </motion.div>

      {/* Thank you message */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          {step.title || "You're All Set!"}
        </h1>
        {step.subtitle && (
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {step.subtitle}
          </p>
        )}
      </div>

      {/* Custom content */}
      {step.content && (
        <div 
          className="prose prose-lg prose-gray max-w-none text-center"
          dangerouslySetInnerHTML={{ __html: step.content }}
        />
      )}

      {/* What happens next */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showResults ? 1 : 0, y: showResults ? 0 : 20 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-0">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            What Happens Next?
          </h3>
          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">1</span>
              </div>
              <p className="text-gray-700">
                Check your email for a personalized list of housing options in your area
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">2</span>
              </div>
              <p className="text-gray-700">
                We'll send you updates when new properties become available
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">3</span>
              </div>
              <p className="text-gray-700">
                Our housing specialists will reach out within 24 hours to assist you
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Submitted information summary */}
      {(responses.email || responses.phone || responses.zipCode) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-gray-50 rounded-lg p-4 text-sm"
        >
          <p className="text-gray-600 mb-2">We have your information:</p>
          <div className="space-y-1">
            {responses.email && (
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="w-4 h-4" />
                {responses.email}
              </div>
            )}
            {responses.phone && (
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="w-4 h-4" />
                {responses.phone}
              </div>
            )}
            {(responses.zipCode || responses.zip_code || responses.zip) && (
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="w-4 h-4" />
                ZIP: {responses.zipCode || responses.zip_code || responses.zip}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Redirect countdown */}
      {redirectCountdown !== null && redirectCountdown > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-lg text-gray-600">
            Redirecting to your free guide in{' '}
            <span className="font-bold text-primary">{redirectCountdown}</span>{' '}
            seconds...
          </p>
        </motion.div>
      )}

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Button
          size="lg"
          onClick={handleViewListings}
          className="group"
          style={{
            backgroundColor: styleConfig?.primaryColor || undefined,
          }}
        >
          <Home className="w-5 h-5 mr-2" />
          View Available Housing Now
          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
        </Button>
        
        <Button
          size="lg"
          variant="outline"
          onClick={() => navigate('/')}
        >
          Return to Homepage
        </Button>
      </motion.div>
    </div>
  );
}