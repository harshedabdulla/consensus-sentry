// lucide-react 1.x removed brand marks (no Github icon). Per the design rules
// (Lucide outline icons only — no inline brand SVGs), GitBranch is the faithful
// repository-semantic substitute. The aria-label makes the destination clear.
import { GitBranch, MessagesSquare } from "lucide-react";

const REPO_URL = "https://github.com/harshedabdulla/consensus-sentry";
const DISCUSSIONS_URL = `${REPO_URL}/discussions`;

export function Footer() {
  return (
    <footer className="mt-28 px-6 pb-12 md:mt-40">
      <div className="mx-auto max-w-[1200px] border-t border-bone-mist pt-10">
        <div className="flex flex-col justify-between gap-6 sm:flex-row">
          <div>
            <p className="text-body font-medium text-lampblack">
              Consensus Sentry
            </p>
            <p className="mt-1 text-[13px] text-steel">
              A research project on AI accountability infrastructure
            </p>
            <p className="mt-3 text-[13px] text-slate-pencil">
              Independent research · Cochin University of Science and Technology
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:items-end">
            <div className="flex items-center gap-4">
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub repository"
                className="text-lampblack transition-colors hover:text-steel"
              >
                <GitBranch size={16} aria-hidden="true" />
              </a>
              <a
                href={DISCUSSIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub discussions"
                className="text-lampblack transition-colors hover:text-steel"
              >
                <MessagesSquare size={16} aria-hidden="true" />
              </a>
            </div>
            <p className="text-caption text-slate-pencil">
              © 2026 · Source available, license pending
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
