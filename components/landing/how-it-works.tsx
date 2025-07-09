"use client";

import { motion } from "framer-motion";

const HowItWorks = () => {
  const steps = [
    {
      step: "01",
      title: "Create Your Event",
      description:
        "Choose from our beautiful templates or start from scratch. Add your event details and customize the design.",
    },
    {
      step: "02",
      title: "Add Your Guests",
      description:
        "Import your guest list or add guests manually. Our AI will help you organize and categorize them.",
    },
    {
      step: "03",
      title: "Send & Track",
      description:
        "Send beautiful digital invitations and track responses, opens, and engagement in real-time.",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
            How it works
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Get started in just three simple steps
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connection lines - positioned to connect the step circles */}
          <div className="hidden md:block absolute top-10 left-[calc(33.333%+2rem)] right-[calc(33.333%+2rem)] h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent transform -translate-y-1/2 z-0" />
          <div className="hidden md:block absolute top-10 left-[calc(66.666%+2rem)] right-[calc(66.666%+2rem)] h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent transform -translate-y-1/2 z-0" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="text-center relative z-10"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg"
              >
                <span className="text-white font-bold text-2xl">
                  {step.step}
                </span>
              </motion.div>

              <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                {step.title}
              </h3>
              <p className="text-slate-600 leading-relaxed max-w-sm mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Additional info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold text-slate-900 mb-4">
              Ready to get started?
            </h3>
            <p className="text-slate-600 mb-6">
              Join thousands of event organizers who have already transformed
              their events with InviteFlow.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Start Creating Now
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
