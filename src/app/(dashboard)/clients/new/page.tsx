// src/app/(dashboard)/clients/new/page.tsx

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CreateClientForm } from "@/features/clients/components/CreateClientForm";

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <Link
          href="/clients"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Clients
        </Link>
        <h1 className="text-xl font-semibold">Create Client</h1>
        <p className="text-sm text-muted-foreground">
          Add a new client to start managing their campaigns
        </p>
      </div>

      {/* Form */}
      <CreateClientForm />
    </div>
  );
}