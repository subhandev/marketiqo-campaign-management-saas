// src/features/clients/components/ClientDetail.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Client } from "@/features/clients/types";
import { useClientMutations } from "@/features/clients/hooks/useClients";

interface ClientDetailProps {
  client: Client;
}

export function ClientDetail({ client }: ClientDetailProps) {
  const router = useRouter();
  const { remove, loading } = useClientMutations();
  const [activeTab, setActiveTab] = useState("overview");

  const handleDelete = async () => {
    await remove(client.id);
    router.push("/clients");
  };

  const initials = client.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/clients")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Clients
        </button>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => router.push(`/clients/${client.id}?edit=true`)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Create Campaign
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/clients/${client.id}?edit=true`)
                }
              >
                Edit Client
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                Delete Client
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Client Header */}
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-lg font-semibold">
          {initials}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{client.name}</h1>
            <Badge
              variant={client.status === "active" ? "default" : "secondary"}
            >
              {client.status}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {client.industry && <span>Industry: {client.industry}</span>}
            {client.email && <span>{client.email}</span>}
            <span>
              Added on{" "}
              {new Date(client.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
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
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Client Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium">Client Information</h2>
                <button
                  onClick={() =>
                    router.push(`/clients/${client.id}?edit=true`)
                  }
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Edit
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground">Company / Brand</span>
                  <span>{client.company || "—"}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground">Industry</span>
                  {client.industry ? (
                    <Badge variant="secondary" className="w-fit">
                      {client.industry}
                    </Badge>
                  ) : (
                    <span>—</span>
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground">Email</span>
                  <span>{client.email || "—"}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground">Notes</span>
                  <span className="text-sm leading-relaxed">
                    {client.notes || "—"}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground">Added On</span>
                  <span>
                    {new Date(client.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Campaigns Preview */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium">
                  Campaigns ({client.campaigns?.length ?? 0})
                </h2>
                <button
                  onClick={() => setActiveTab("campaigns")}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  View All
                </button>
              </div>

              {client.campaigns && client.campaigns.length > 0 ? (
                <div className="space-y-2">
                  {client.campaigns.slice(0, 3).map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() =>
                        router.push(`/campaigns/${campaign.id}`)
                      }
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">
                          {campaign.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {campaign.platform} ·{" "}
                          {campaign.startDate
                            ? `Started ${new Date(
                                campaign.startDate
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}`
                            : "No start date"}
                        </span>
                      </div>
                      <Badge
                        variant={
                          campaign.status === "active" ? "default" : "secondary"
                        }
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center border rounded-lg bg-muted/20">
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
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/campaigns/${campaign.id}`)}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{campaign.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {campaign.platform} ·{" "}
                      {campaign.startDate
                        ? `Started ${new Date(
                            campaign.startDate
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}`
                        : "No start date"}
                    </span>
                  </div>
                  <Badge
                    variant={
                      campaign.status === "active" ? "default" : "secondary"
                    }
                  >
                    {campaign.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-muted/20">
              <p className="text-sm text-muted-foreground">No campaigns yet</p>
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

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-6">
          <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-muted/20">
            <p className="text-sm text-muted-foreground">
              Activity tracking coming soon
            </p>
          </div>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="mt-6">
          <div className="rounded-lg border p-4">
            {client.notes ? (
              <p className="text-sm leading-relaxed">{client.notes}</p>
            ) : (
              <p className="text-sm text-muted-foreground">No notes added</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}