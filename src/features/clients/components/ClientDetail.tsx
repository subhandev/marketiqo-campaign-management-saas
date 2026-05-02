"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MoreHorizontal, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { EditClientForm } from "@/features/clients/components/EditClientForm";
import { Client } from "@/features/clients/types";
import { useClientMutations } from "@/features/clients/hooks/useClients";
import { cn } from "@/lib/utils";

interface ClientDetailProps {
  client: Client;
  initialEdit?: boolean;
  onEditSuccess?: () => void;
}

const statusStyles = {
  active: "bg-green-50 text-green-700 border-green-200",
  inactive: "bg-zinc-100 text-zinc-500 border-zinc-200",
};

const campaignStatusStyles: Record<string, string> = {
  planned: "bg-blue-50 text-blue-700 border-blue-200",
  active: "bg-green-50 text-green-700 border-green-200",
  at_risk: "bg-orange-50 text-orange-700 border-orange-200",
  completed: "bg-zinc-100 text-zinc-500 border-zinc-200",
  archived: "bg-zinc-100 text-zinc-400 border-zinc-200",
};

const campaignStatusLabel: Record<string, string> = {
  planned: "Planned",
  active: "Active",
  at_risk: "At Risk",
  completed: "Completed",
  archived: "Archived",
};

export function ClientDetail({
  client,
  initialEdit = false,
  onEditSuccess,
}: ClientDetailProps) {
  const router = useRouter();
  const { remove, loading } = useClientMutations();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(initialEdit);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    await remove(client.id);
    router.push("/clients");
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
    onEditSuccess?.();
    router.refresh();
  };

  const initials = client.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={showDeleteConfirm}
        title="Delete client?"
        description={`This will permanently delete "${client.name}" and all associated data. This action cannot be undone.`}
        confirmLabel="Delete Client"
        loading={loading}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Back */}
      <button
        onClick={() => router.push("/clients")}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group w-fit"
      >
        <span className="flex items-center justify-center h-7 w-7 rounded-md border border-border bg-card group-hover:bg-muted transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
        </span>
        Back to Clients
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold">
            {initials}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-semibold tracking-tight">
                {client.name}
              </h1>
              <span
                className={cn(
                  "text-xs px-2.5 py-1 rounded-full font-medium border",
                  statusStyles[client.status as keyof typeof statusStyles] ??
                    statusStyles.inactive,
                )}
              >
                {client.status}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
              {client.industry && (
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  {client.industry}
                </span>
              )}
              {client.email && <span>{client.email}</span>}
              <span>
                Added{" "}
                {new Date(client.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing((e) => !e)}
          >
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            {isEditing ? "Cancel Edit" : "Edit"}
          </Button>
          <Button
            size="sm"
            onClick={() => router.push(`/campaigns/new?clientId=${client.id}`)}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Campaign
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                Edit Client
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Client
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Edit Form — inline, slides in below header */}
      {isEditing && (
        <EditClientForm
          client={client}
          onSuccess={handleEditSuccess}
          onCancel={() => setIsEditing(false)}
        />
      )}

      {/* Tabs */}
      {!isEditing && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">
              Campaigns
              {client.campaigns && client.campaigns.length > 0 && (
                <span className="ml-1.5 text-xs bg-muted px-1.5 py-0.5 rounded-full">
                  {client.campaigns.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Client Info Card */}
              <div className="rounded-xl border border-border bg-card shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Client Information</h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-3 text-sm">
                  {[
                    { label: "Company / Brand", value: client.company },
                    { label: "Industry", value: client.industry },
                    { label: "Email", value: client.email },
                    { label: "Phone", value: client.phone },
                    { label: "Website", value: client.website },
                    {
                      label: "Added On",
                      value: new Date(client.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        },
                      ),
                    },
                  ].map((item) => (
                    <div key={item.label} className="space-y-0.5">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {item.label}
                      </p>
                      <p className="font-medium">{item.value || "—"}</p>
                    </div>
                  ))}
                  {client.notes && (
                    <div className="space-y-0.5 pt-2 border-t border-border">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Notes
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {client.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Campaigns Preview */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold">
                    Campaigns ({client.campaigns?.length ?? 0})
                  </h2>
                  {(client.campaigns?.length ?? 0) > 3 && (
                    <button
                      onClick={() => setActiveTab("campaigns")}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      View All
                    </button>
                  )}
                </div>

                {client.campaigns && client.campaigns.length > 0 ? (
                  <div className="space-y-2">
                    {client.campaigns.slice(0, 3).map((campaign) => (
                      <div
                        key={campaign.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/40 cursor-pointer transition-colors shadow-sm"
                        onClick={() => router.push(`/campaigns/${campaign.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                            {campaign.name[0]}
                          </div>
                          <div className="flex flex-col leading-tight">
                            <span className="text-sm font-medium">
                              {campaign.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {campaign.platform} ·{" "}
                              {campaign.startDate
                                ? `Started ${new Date(campaign.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                                : "No start date"}
                            </span>
                          </div>
                        </div>
                        <span
                          className={cn(
                            "text-xs px-2.5 py-1 rounded-full font-medium border",
                            campaignStatusStyles[campaign.status] ??
                              campaignStatusStyles.planned,
                          )}
                        >
                          {campaignStatusLabel[campaign.status] ??
                            campaign.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-border bg-muted/20">
                    <p className="text-sm text-muted-foreground">
                      No campaigns yet
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3"
                      onClick={() =>
                        router.push(`/campaigns/new?clientId=${client.id}`)
                      }
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Create Campaign
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="mt-6">
            {client.campaigns && client.campaigns.length > 0 ? (
              <div className="space-y-2">
                {client.campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/40 cursor-pointer transition-colors shadow-sm"
                    onClick={() => router.push(`/campaigns/${campaign.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                        {campaign.name[0]}
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-sm font-medium">
                          {campaign.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {campaign.platform} ·{" "}
                          {campaign.startDate
                            ? `Started ${new Date(campaign.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                            : "No start date"}
                        </span>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-full font-medium border",
                        campaignStatusStyles[campaign.status] ??
                          campaignStatusStyles.planned,
                      )}
                    >
                      {campaignStatusLabel[campaign.status] ?? campaign.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-border bg-muted/20">
                <p className="text-sm text-muted-foreground">
                  No campaigns yet
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  onClick={() =>
                    router.push(`/campaigns/new?clientId=${client.id}`)
                  }
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Create Campaign
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="mt-6">
            <div className="max-w-2xl rounded-xl border border-border bg-card shadow-sm p-6 space-y-2">
              <h2 className="text-sm font-semibold">Notes</h2>
              {client.notes ? (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {client.notes}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No notes added.{" "}
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-primary hover:underline"
                  >
                    Add notes
                  </button>
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
