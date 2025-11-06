import {
	type DocumentData,
	type QueryConstraint,
	addDoc,
	collection,
	deleteDoc,
	doc,
	onSnapshot,
	query,
	updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";

export function useFirestoreCollection<T = DocumentData>(
	collectionName: string,
	...queryConstraints: QueryConstraint[]
) {
	const [data, setData] = useState<T[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		setLoading(true);
		const q = query(collection(db, collectionName), ...queryConstraints);

		const unsubscribe = onSnapshot(
			q,
			(snapshot) => {
				const docs = snapshot.docs.map(
					(doc) =>
						({
							id: doc.id,
							...doc.data(),
						}) as T,
				);
				setData(docs);
				setLoading(false);
			},
			(err) => {
				setError(err);
				setLoading(false);
			},
		);

		return () => unsubscribe();
	}, [collectionName, ...queryConstraints]);

	return { data, loading, error };
}

export function useFirestoreDocument<T = DocumentData>(collectionName: string, documentId: string) {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		if (!documentId) {
			setLoading(false);
			return;
		}

		const docRef = doc(db, collectionName, documentId);

		const unsubscribe = onSnapshot(
			docRef,
			(doc) => {
				if (doc.exists()) {
					setData({ id: doc.id, ...doc.data() } as T);
				} else {
					setData(null);
				}
				setLoading(false);
			},
			(err) => {
				setError(err);
				setLoading(false);
			},
		);

		return () => unsubscribe();
	}, [collectionName, documentId]);

	return { data, loading, error };
}

export async function addDocument<T = DocumentData>(collectionName: string, data: T) {
	try {
		const docRef = await addDoc(collection(db, collectionName), data);
		return { id: docRef.id, success: true };
	} catch (error) {
		console.error("Error adding document:", error);
		return { id: null, success: false, error };
	}
}

export async function updateDocument<T = Partial<DocumentData>>(
	collectionName: string,
	documentId: string,
	data: T,
) {
	try {
		const docRef = doc(db, collectionName, documentId);
		await updateDoc(docRef, data);
		return { success: true };
	} catch (error) {
		console.error("Error updating document:", error);
		return { success: false, error };
	}
}

export async function deleteDocument(collectionName: string, documentId: string) {
	try {
		const docRef = doc(db, collectionName, documentId);
		await deleteDoc(docRef);
		return { success: true };
	} catch (error) {
		console.error("Error deleting document:", error);
		return { success: false, error };
	}
}
