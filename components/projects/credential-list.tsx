"use client";

import { useState } from "react";
import { Copy, Eye, EyeOff, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  createCredential,
  deleteCredential,
  updateCredential,
} from "@/lib/firebase/firestore";
import { useAuthContext } from "@/components/auth/auth-provider";
import { CREDENTIAL_TYPES } from "@/lib/utils/constants";
import type { Credential, CredentialInput } from "@/lib/types";

interface CredentialListProps {
  projectId: string;
  credentials: Credential[];
  onChanged: () => void;
}

const emptyForm: CredentialInput = {
  label: "",
  type: "api_key",
  username: "",
  secret: "",
  url: "",
  notes: "",
};

function SecretField({ value }: { value: string }) {
  const [visible, setVisible] = useState(false);

  async function copySecret() {
    await navigator.clipboard.writeText(value);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm">
        {visible ? value : "••••••••••••"}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
      <Button type="button" variant="ghost" size="icon" onClick={copySecret}>
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );
}

function CredentialFormDialog({
  projectId,
  credential,
  onSaved,
  trigger,
}: {
  projectId: string;
  credential?: Credential;
  onSaved: () => void;
  trigger: React.ReactElement<{ onClick?: () => void }>;
}) {
  const { user } = useAuthContext();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<CredentialInput>(
    credential
      ? {
          label: credential.label,
          type: credential.type,
          username: credential.username ?? "",
          secret: credential.secret,
          url: credential.url ?? "",
          notes: credential.notes ?? "",
        }
      : emptyForm
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      if (credential) {
        await updateCredential(user.uid, projectId, credential.id, values);
      } else {
        await createCredential(user.uid, projectId, values);
      }
      setOpen(false);
      if (!credential) setValues(emptyForm);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save credential");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {credential ? "Edit credential" : "Add credential"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cred-label">Label</Label>
            <Input
              id="cred-label"
              value={values.label}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  label: event.target.value,
                }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cred-type">Type</Label>
            <Select
              id="cred-type"
              value={values.type}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  type: event.target.value as CredentialInput["type"],
                }))
              }
            >
              {CREDENTIAL_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cred-username">Username</Label>
            <Input
              id="cred-username"
              value={values.username ?? ""}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  username: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cred-secret">Secret / API key</Label>
            <Input
              id="cred-secret"
              value={values.secret}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  secret: event.target.value,
                }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cred-url">URL</Label>
            <Input
              id="cred-url"
              value={values.url ?? ""}
              onChange={(event) =>
                setValues((current) => ({ ...current, url: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cred-notes">Notes</Label>
            <Textarea
              id="cred-notes"
              value={values.notes ?? ""}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CredentialList({
  projectId,
  credentials,
  onChanged,
}: CredentialListProps) {
  const { user } = useAuthContext();

  async function handleDelete(credentialId: string) {
    if (!user) return;
    if (!confirm("Delete this credential?")) return;
    await deleteCredential(user.uid, projectId, credentialId);
    onChanged();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CredentialFormDialog
          projectId={projectId}
          onSaved={onChanged}
          trigger={
            <Button>
              <Plus className="h-4 w-4" />
              Add credential
            </Button>
          }
        />
      </div>

      {credentials.length === 0 ? (
        <p className="text-sm text-zinc-500">No credentials saved yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Secret</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {credentials.map((credential) => (
              <TableRow key={credential.id}>
                <TableCell className="font-medium">{credential.label}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{credential.type}</Badge>
                </TableCell>
                <TableCell>{credential.username || "—"}</TableCell>
                <TableCell>
                  <SecretField value={credential.secret} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <CredentialFormDialog
                      projectId={projectId}
                      credential={credential}
                      onSaved={onChanged}
                      trigger={
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(credential.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
