import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
  type Timestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "./config";
import {
  type AmountHistoryEntry,
  type AmountHistoryInput,
  type Credential,
  type CredentialInput,
  type Payment,
  type PaymentInput,
  type Project,
  type ProjectInput,
  timestampToDate,
} from "@/lib/types";

function projectsRef(uid: string) {
  return collection(getFirebaseDb(), "users", uid, "projects");
}

function projectRef(uid: string, projectId: string) {
  return doc(getFirebaseDb(), "users", uid, "projects", projectId);
}

function amountHistoryRef(uid: string, projectId: string) {
  return collection(getFirebaseDb(), "users", uid, "projects", projectId, "amountHistory");
}

function credentialsRef(uid: string, projectId: string) {
  return collection(getFirebaseDb(), "users", uid, "projects", projectId, "credentials");
}

function paymentsRef(uid: string, projectId: string) {
  return collection(getFirebaseDb(), "users", uid, "projects", projectId, "payments");
}

function mapProject(id: string, data: DocumentData): Project {
  return {
    id,
    name: data.name,
    client: data.client,
    description: data.description,
    status: data.status,
    startDate: timestampToDate(data.startDate as Timestamp),
    endDate: timestampToDate(data.endDate as Timestamp),
    currency: data.currency ?? "INR",
    amount: data.amount,
    color: data.color,
    createdAt: timestampToDate(data.createdAt as Timestamp) ?? new Date(),
    updatedAt: timestampToDate(data.updatedAt as Timestamp) ?? new Date(),
  };
}

function mapAmountHistory(id: string, data: DocumentData): AmountHistoryEntry {
  return {
    id,
    amount: data.amount,
    effectiveDate:
      timestampToDate(data.effectiveDate as Timestamp) ?? new Date(),
    note: data.note,
    createdAt: timestampToDate(data.createdAt as Timestamp) ?? new Date(),
  };
}

function mapCredential(id: string, data: DocumentData): Credential {
  return {
    id,
    label: data.label,
    type: data.type,
    username: data.username,
    secret: data.secret,
    url: data.url,
    notes: data.notes,
    createdAt: timestampToDate(data.createdAt as Timestamp) ?? new Date(),
    updatedAt: timestampToDate(data.updatedAt as Timestamp) ?? new Date(),
  };
}

function mapPayment(id: string, data: DocumentData): Payment {
  return {
    id,
    amount: data.amount,
    currency: data.currency ?? "INR",
    date: timestampToDate(data.date as Timestamp) ?? new Date(),
    status: data.status,
    invoiceNumber: data.invoiceNumber,
    description: data.description,
    paymentMethod: data.paymentMethod,
    createdAt: timestampToDate(data.createdAt as Timestamp) ?? new Date(),
    updatedAt: timestampToDate(data.updatedAt as Timestamp) ?? new Date(),
  };
}

function toFirestoreDate(date?: Date) {
  return date ?? null;
}

export async function getProjects(uid: string): Promise<Project[]> {
  const snapshot = await getDocs(
    query(projectsRef(uid), orderBy("updatedAt", "desc"))
  );
  return snapshot.docs.map((docSnap) => mapProject(docSnap.id, docSnap.data()));
}

export async function getProject(
  uid: string,
  projectId: string
): Promise<Project | null> {
  const snapshot = await getDoc(projectRef(uid, projectId));
  if (!snapshot.exists()) return null;
  return mapProject(snapshot.id, snapshot.data());
}

export async function createProject(
  uid: string,
  input: ProjectInput,
  initialAmount?: number,
  amountNote?: string
): Promise<string> {
  const docRef = doc(projectsRef(uid));
  const now = serverTimestamp();

  await setDoc(docRef, {
    name: input.name,
    client: input.client,
    description: input.description ?? null,
    status: input.status,
    startDate: toFirestoreDate(input.startDate),
    endDate: toFirestoreDate(input.endDate),
    currency: input.currency,
    amount: initialAmount ?? input.amount ?? null,
    color: input.color ?? null,
    createdAt: now,
    updatedAt: now,
  });

  const amount = initialAmount ?? input.amount;
  if (amount != null) {
    await addDoc(amountHistoryRef(uid, docRef.id), {
      amount,
      effectiveDate: input.startDate ?? new Date(),
      note: amountNote ?? "Initial amount",
      createdAt: now,
    });
  }

  return docRef.id;
}

export async function updateProject(
  uid: string,
  projectId: string,
  input: Partial<ProjectInput>
): Promise<void> {
  await updateDoc(projectRef(uid, projectId), {
    ...(input.name !== undefined && { name: input.name }),
    ...(input.client !== undefined && { client: input.client }),
    ...(input.description !== undefined && {
      description: input.description ?? null,
    }),
    ...(input.status !== undefined && { status: input.status }),
    ...(input.startDate !== undefined && {
      startDate: toFirestoreDate(input.startDate),
    }),
    ...(input.endDate !== undefined && {
      endDate: toFirestoreDate(input.endDate),
    }),
    ...(input.currency !== undefined && { currency: input.currency }),
    ...(input.color !== undefined && { color: input.color ?? null }),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProject(
  uid: string,
  projectId: string
): Promise<void> {
  const [amountHistory, credentials, payments] = await Promise.all([
    getDocs(amountHistoryRef(uid, projectId)),
    getDocs(credentialsRef(uid, projectId)),
    getDocs(paymentsRef(uid, projectId)),
  ]);

  await Promise.all([
    ...amountHistory.docs.map((d) => deleteDoc(d.ref)),
    ...credentials.docs.map((d) => deleteDoc(d.ref)),
    ...payments.docs.map((d) => deleteDoc(d.ref)),
    deleteDoc(projectRef(uid, projectId)),
  ]);
}

export async function getAmountHistory(
  uid: string,
  projectId: string
): Promise<AmountHistoryEntry[]> {
  const snapshot = await getDocs(
    query(amountHistoryRef(uid, projectId), orderBy("effectiveDate", "desc"))
  );
  return snapshot.docs.map((docSnap) =>
    mapAmountHistory(docSnap.id, docSnap.data())
  );
}

export async function updateProjectAmount(
  uid: string,
  projectId: string,
  input: AmountHistoryInput
): Promise<void> {
  await addDoc(amountHistoryRef(uid, projectId), {
    amount: input.amount,
    effectiveDate: input.effectiveDate,
    note: input.note ?? null,
    createdAt: serverTimestamp(),
  });

  await updateDoc(projectRef(uid, projectId), {
    amount: input.amount,
    updatedAt: serverTimestamp(),
  });
}

export async function getCredentials(
  uid: string,
  projectId: string
): Promise<Credential[]> {
  const snapshot = await getDocs(
    query(credentialsRef(uid, projectId), orderBy("createdAt", "desc"))
  );
  return snapshot.docs.map((docSnap) =>
    mapCredential(docSnap.id, docSnap.data())
  );
}

export async function createCredential(
  uid: string,
  projectId: string,
  input: CredentialInput
): Promise<string> {
  const docRef = await addDoc(credentialsRef(uid, projectId), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateCredential(
  uid: string,
  projectId: string,
  credentialId: string,
  input: Partial<CredentialInput>
): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), "users", uid, "projects", projectId, "credentials", credentialId), {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCredential(
  uid: string,
  projectId: string,
  credentialId: string
): Promise<void> {
  await deleteDoc(
    doc(getFirebaseDb(), "users", uid, "projects", projectId, "credentials", credentialId)
  );
}

export async function getPayments(
  uid: string,
  projectId: string
): Promise<Payment[]> {
  const snapshot = await getDocs(
    query(paymentsRef(uid, projectId), orderBy("date", "desc"))
  );
  return snapshot.docs.map((docSnap) => mapPayment(docSnap.id, docSnap.data()));
}

export async function createPayment(
  uid: string,
  projectId: string,
  input: PaymentInput
): Promise<string> {
  const docRef = await addDoc(paymentsRef(uid, projectId), {
    ...input,
    date: input.date,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updatePayment(
  uid: string,
  projectId: string,
  paymentId: string,
  input: Partial<PaymentInput>
): Promise<void> {
  await updateDoc(
    doc(getFirebaseDb(), "users", uid, "projects", projectId, "payments", paymentId),
    {
      ...input,
      updatedAt: serverTimestamp(),
    }
  );
}

export async function deletePayment(
  uid: string,
  projectId: string,
  paymentId: string
): Promise<void> {
  await deleteDoc(
    doc(getFirebaseDb(), "users", uid, "projects", projectId, "payments", paymentId)
  );
}

export async function getAllPaymentsForUser(
  uid: string
): Promise<Array<Payment & { projectId: string; projectName: string }>> {
  const projects = await getProjects(uid);
  const results = await Promise.all(
    projects.map(async (project) => {
      const payments = await getPayments(uid, project.id);
      return payments.map((payment) => ({
        ...payment,
        projectId: project.id,
        projectName: project.name,
      }));
    })
  );
  return results.flat().sort((a, b) => b.date.getTime() - a.date.getTime());
}
