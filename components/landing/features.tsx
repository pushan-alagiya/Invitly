"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Users, Sparkles, Mail } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Calendar,
      title: "Project & Event Creation",
      description:
        "Create stunning invitations with our intuitive drag-and-drop editor and customizable templates.",
    },
    {
      icon: Users,
      title: "Guest List Management",
      description:
        "Organize your guest list with smart categorization, RSVP tracking, and contact management.",
    },
    {
      icon: Sparkles,
      title: "AI-Powered Suggestions",
      description:
        "Get intelligent recommendations for guest lists, invitation designs, and event planning.",
    },
    {
      icon: Mail,
      title: "Smart Invitations & Tracking",
      description:
        "Send beautiful digital invitations and track responses, opens, and engagement in real-time.",
    },
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
            Everything you need for perfect events
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            From creation to tracking, we&apos;ve got every aspect of your event
            covered.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 group border-0 shadow-lg">
                <CardHeader>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors"
                  >
                    <feature.icon className="h-8 w-8 text-primary" />
                  </motion.div>
                  <CardTitle className="text-xl mb-3">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
