import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CreateClientForm } from "@/features/clients/components/CreateClientForm";

export default function NewClientPage() {
  return (
    <div className="space-y-8 w-full">
      {/* Back Button */}
      <Link
        href="/clients"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group w-fit"
      >
        <span className="flex items-center justify-center h-7 w-7 rounded-md border border-border bg-card group-hover:bg-muted transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
        </span>
        Back to Clients
      </Link>

      {/* Heading */}
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Create Client</h1>
        <p className="text-sm text-muted-foreground">
          Add a new client to start managing their campaigns and track results.
        </p>
      </div>

      {/* Form */}
      <CreateClientForm />
    </div>
  )
}
