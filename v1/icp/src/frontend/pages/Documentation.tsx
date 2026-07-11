import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
Search,
Book,
Menu,
X,
Vote,
FileText,
Users,
Wallet,
Clock,
Lightbulb,
} from "lucide-react"

interface Section {
  id: string
  label: string
  icon: React.ReactNode
}

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [activeSection, setActiveSection] = useState<string>("introduction")
  //const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const [mounted, setMounted] = useState<boolean>(false)

  useEffect(() => {
    setMounted(true)
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "")
      if (hash) {
        setActiveSection(hash)
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" })
      }
    }
    handleHashChange()
    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && sidebarOpen) {
        setSidebarOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [sidebarOpen])

  // const copyToClipboard = (text: string, snippetId: string) => {
  //   navigator.clipboard.writeText(text)
  //   setCopiedSnippet(snippetId)
  //   setTimeout(() => setCopiedSnippet(null), 2000)
  // }

  const sections: Section[] = [
    { id: "introduction", label: "Introduction", icon: <Book className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: "governance-process", label: "Governance Process", icon: <Vote className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: "proposal-submission", label: "Proposal Submission", icon: <FileText className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: "voting-mechanism", label: "Voting Mechanism", icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: "stake-mechanics", label: "Stake Mechanics", icon: <Wallet className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: "timelines", label: "Timelines", icon: <Clock className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: "best-practices", label: "Best Practices", icon: <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5" /> },
  ]

  const filteredSections = searchQuery
    ? sections.filter((section) => section.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : sections

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile menu button */}
      <div className="fixed bottom-4 right-4 z-50 md:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-black text-white p-4 rounded-full hover:bg-gray-800 transition-colors"
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-[85%] sm:w-72 bg-white border-r border-gray-200 pt-16 transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen md:w-64 md:pt-20 overflow-y-auto ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search documentation..."
                className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              />
            </div>

            <nav>
              <ul className="space-y-1">
                {filteredSections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className={`flex items-center px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                        activeSection === section.id
                          ? "bg-gray-100 text-black"
                          : "text-gray-600 hover:bg-gray-50 hover:text-black"
                      }`}
                      onClick={(e: React.MouseEvent) => {
                        e.preventDefault()
                        setActiveSection(section.id)
                        document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" })
                        window.history.pushState(null, "", `#${section.id}`)
                        setSidebarOpen(false)
                      }}
                    >
                      <span className="mr-3">{section.icon}</span>
                      {section.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 px-4 sm:px-6 pt-24 pb-16 md:px-8 lg:px-12 xl:px-16 max-w-5xl mx-auto">
          {/* Introduction Section */}
          <section id="introduction" className="mb-12 sm:mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 tracking-tight">
                Consensus Sentry Documentation
              </h1>
              <p className="text-base sm:text-lg text-gray-700 mb-6">
                Create a proposal to improve AI safety rules, modify existing guardrails, or suggest protocol improvements.
              </p>
            </motion.div>
          </section>

          {/* Other sections */}
          <section id="governance-process" className="mb-12 sm:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 border-b pb-2">Governance Process</h2>
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-2">Overview</h3>
                <p className="text-sm text-gray-700 mb-4">
                  The governance process involves community participation to ensure the safety and effectiveness of AI systems.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                  <li>Proposal Creation</li>
                  <li>Community Discussion</li>
                  <li>Voting Period</li>
                  <li>Implementation</li>
                </ul>
              </div>
            </motion.div>
          </section>

          {/* Additional sections can be added here following the same structure */}
        </main>
      </div>
    </div>
  )
}