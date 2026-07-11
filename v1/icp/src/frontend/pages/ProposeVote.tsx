import { useState } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import {
  Upload,
  Info,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Wallet,
} from "lucide-react"

interface FormData {
  title: string
  body: string
  summary: string
  motivation: string
  specification: string
  benefits: string
  risks: string
  proposalType: string
  category: string
  stake: string
}

export default function SubmitProposalPage() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const { register, handleSubmit } = useForm<FormData>({
    defaultValues: {
      title: "",
      body: "",
      summary: "",
      motivation: "",
      specification: "",
      benefits: "",
      risks: "",
      proposalType: "rule",
      category: "",
      stake: "100",
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    console.log(data)
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const nextStep = () => {
    setStep(step + 1)
    window.scrollTo(0, 0)
  }

  const prevStep = () => {
    setStep(step - 1)
    window.scrollTo(0, 0)
  }

  return (
    <div className="relative min-h-screen">
      <main className="flex-1 px-4">
        {/* Hero Section
        <section className="relative pt-20 pb-16 md:pt-40 md:pb-24">
          <div className="container relative z-10 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center"
            >
              <div className="inline-flex items-center rounded-full border bg-gray-100 px-4 py-1.5 text-sm font-medium">
                <span className="text-gray-600">Governance</span>
                <hr className="mx-2 h-4 w-px bg-gray-300" />
                <span>Submit Proposal</span>
              </div>
              <h1 className="text-4xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl">
                Submit a Governance Proposal
              </h1>
              <p className="max-w-[85%] text-gray-600 sm:text-xl">
                Create a proposal to improve AI safety rules, modify existing guardrails, or suggest protocol
                improvements.
              </p>
            </motion.div>
          </div>
        </section> */}

        {/* Proposal Submission Process */}
        <section className="py-8 relative z-10">
          <div className="container max-w-4xl mx-auto">
            {!isSubmitted ? (
              <>
                {/* Progress Steps */}
                <div className="mb-12">
                  <div className="flex justify-between items-center mb-2">
                    {["Eligibility", "Proposal Details", "Review & Submit"].map((stepName, index) => (
                      <div
                        key={index}
                        className={`flex flex-col items-center ${index + 1 < step ? "text-gray-600" : index + 1 === step ? "text-gray-900" : "text-gray-400"}`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                            index + 1 < step
                              ? "bg-gray-600 text-white"
                              : index + 1 === step
                                ? "bg-gray-50 border-2 border-gray-600"
                                : "bg-gray-100 border-2 border-gray-600"
                          }`}
                        >
                          {index + 1 < step ? <CheckCircle className="h-5 w-5" /> : <span>{index + 1}</span>}
                        </div>
                        <span className="text-sm hidden md:block">{stepName}</span>
                      </div>
                    ))}
                  </div>
                  <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-gray-600 transition-all duration-300"
                      style={{ width: `${((step - 1) / 2) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Step 1: Eligibility Check */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-8"
                  >
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h2 className="text-2xl font-semibold mb-4">Eligibility Requirements</h2>
                      <p className="mb-6 text-gray-600">
                        Before submitting a proposal, please ensure you meet the following requirements:
                      </p>

                      <div className="space-y-6">
                        {/* Eligibility items... */}
                      </div>

                      <div className="mt-8 p-4 bg-gray-50 rounded-lg flex items-start gap-3 border border-gray-200">
                        <AlertCircle className="h-5 w-5 text-gray-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm">
                            <strong>Important:</strong> Staked tokens will be locked for the duration of the proposal
                            process.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <button className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-md flex items-center justify-center">
                          <Wallet className="mr-2 h-4 w-4" /> Connect Internet Identity
                        </button>
                        <button className="flex-1 border border-gray-600 px-4 py-2 rounded-md">
                          Connect Plug Wallet
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={nextStep}
                        className="bg-gray-900 text-white px-4 py-2 rounded-md flex items-center"
                      >
                        Continue <ChevronRight className="ml-2 h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Proposal Details */}
                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h2 className="text-2xl font-semibold mb-6">Proposal Details</h2>

                      <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="block text-sm font-medium mb-1">Proposal Type</label>
                              <div className="flex flex-col space-y-2">
                                {["rule", "parameter", "treasury", "upgrade"].map((type) => (
                                  <label key={type} className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      value={type}
                                      {...register("proposalType")}
                                      className="h-4 w-4 text-gray-600"
                                    />
                                    <span className="capitalize">{type}</span>
                                  </label>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="block text-sm font-medium mb-1">Category</label>
                              <select
                                {...register("category")}
                                className="w-full p-2 border border-gray-200 rounded-md"
                              >
                                <option value="">Select a category</option>
                                <option value="content-safety">Content Safety</option>
                                <option value="bias-fairness">Bias & Fairness</option>
                                <option value="privacy">Privacy Protection</option>
                                <option value="transparency">Transparency</option>
                                <option value="security">Security</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium mb-1">Proposal Title</label>
                            <input
                              {...register("title")}
                              className="w-full p-2 border border-gray-200 rounded-md"
                              placeholder="Enter a concise, descriptive title"
                            />
                          </div>

                          {/* Other form fields... */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium mb-1">Proposal Body</label>
                            <textarea
                              {...register("body")}
                              className="w-full p-2 border border-gray-200 rounded-md"
                              placeholder="Enter a descriptive body"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium mb-1">Supporting Documents (Optional)</label>
                            <div className="border-2 border-dashed rounded-lg p-6 text-center bg-gray-50">
                              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                              <input type="file" className="hidden" id="file-upload" multiple />
                              <label
                                htmlFor="file-upload"
                                className="cursor-pointer bg-white border border-gray-200 px-4 py-2 rounded-md"
                              >
                                Choose Files
                              </label>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>

                    <div className="flex justify-between mt-8">
                      <button
                        onClick={prevStep}
                        className="border border-gray-600 px-4 py-2 rounded-md"
                      >
                        Back
                      </button>
                      <button
                        onClick={nextStep}
                        className="bg-gray-600 text-white px-4 py-2 rounded-md flex items-center"
                      >
                        Review Proposal <ChevronRight className="ml-2 h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Review & Submit */}
                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h2 className="text-2xl font-semibold mb-6">Review Your Proposal</h2>

                      <div className="space-y-8">
                        {/* Review content... */}

                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Token Stake</h3>
                          <div className="bg-gray-50 p-4 rounded-lg flex items-start gap-3 border border-gray-200">
                            <Info className="h-5 w-5 text-gray-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm">
                                By submitting this proposal, you agree to stake 100 CST tokens.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between mt-8">
                      <button
                        onClick={prevStep}
                        className="border border-gray-600 px-4 py-2 rounded-md"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        className="bg-gray-600 text-white px-4 py-2 rounded-md flex items-center disabled:opacity-50"
                      >
                        {isSubmitting ? "Submitting..." : (
                          <>
                            Submit Proposal <ChevronRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white border border-gray-200 rounded-lg p-8 text-center"
              >
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-gray-600" />
                </div>

                <h2 className="text-2xl font-semibold mb-4">Proposal Submitted Successfully!</h2>

                {/* <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href=""
                    className="bg-gray-600 text-white px-4 py-2 rounded-md flex items-center justify-center"
                  >
                    <FileText className="mr-2 h-4 w-4" /> View Your Proposal
                  </Link>
                  <Link
                    href="/governance"
                    className="border border-gray-600 px-4 py-2 rounded-md"
                  >
                    Return to Governance
                  </Link>
                </div> */}
              </motion.div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}