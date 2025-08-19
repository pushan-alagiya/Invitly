"use client";
import React, { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Lock, Star } from "lucide-react";

interface PremiumFeatureProps {
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradeButton?: boolean;
}

interface PremiumFeaturesListProps {
  showUpgradeButton?: boolean;
}

const premiumFeatures = [
  {
    id: "unlimited_projects",
    name: "Unlimited Projects",
    description: "Create as many projects as you need",
    icon: Star,
  },
  {
    id: "advanced_analytics",
    name: "Advanced Analytics",
    description: "Get detailed insights into your events",
    icon: Star,
  },
  {
    id: "custom_templates",
    name: "Custom Templates",
    description: "Create and save your own invitation templates",
    icon: Star,
  },
  {
    id: "priority_support",
    name: "Priority Support",
    description: "Get faster response times from our support team",
    icon: Star,
  },
  {
    id: "bulk_operations",
    name: "Bulk Operations",
    description: "Manage multiple guests and events at once",
    icon: Star,
  },
  {
    id: "advanced_guest_management",
    name: "Advanced Guest Management",
    description: "Advanced features for managing your guest list",
    icon: Star,
  },
  {
    id: "vendor_management",
    name: "Vendor Management",
    description: "Manage vendors and service providers",
    icon: Star,
  },
  {
    id: "photo_gallery_unlimited",
    name: "Unlimited Photo Gallery",
    description: "Upload unlimited photos to your events",
    icon: Star,
  },
];

export const PremiumFeature: React.FC<PremiumFeatureProps> = ({
  children,
  fallback,
  showUpgradeButton = true,
}) => {
  const { isPremium } = usePermissions();

  if (isPremium()) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="text-center p-4">
          <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <h3 className="font-semibold mb-2">Premium Feature</h3>
          <p className="text-sm text-muted-foreground mb-4">
            This feature is only available for premium users
          </p>
          {showUpgradeButton && (
            <Button size="sm" className="gap-2">
              <Crown className="h-4 w-4" />
              Upgrade to Premium
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export const PremiumFeaturesList: React.FC<PremiumFeaturesListProps> = ({
  showUpgradeButton = true,
}) => {
  const { isPremium } = usePermissions();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {premiumFeatures.map((feature) => {
        const Icon = feature.icon;
        return (
          <Card key={feature.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{feature.name}</CardTitle>
                {!isPremium() && (
                  <Badge variant="secondary" className="ml-auto">
                    <Lock className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        );
      })}

      {!isPremium() && showUpgradeButton && (
        <Card className="md:col-span-2 lg:col-span-3 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-primary" />
              Upgrade to Premium
            </CardTitle>
            <CardDescription>
              Unlock all premium features and take your event planning to the
              next level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" size="lg">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export const PremiumBadge: React.FC<{ className?: string }> = ({
  className,
}) => {
  const { isPremium } = usePermissions();

  if (!isPremium()) return null;

  return (
    <Badge variant="default" className={`gap-1 ${className}`}>
      <Crown className="h-3 w-3" />
      Premium
    </Badge>
  );
};
