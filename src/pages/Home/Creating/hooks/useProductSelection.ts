import { useEffect, useRef, useState } from 'react';
import { tokenStorage } from '../../../../store/tokenStore';
import type { ConversationDetail } from '../../../../types/apiTypes/ConversationTypes';
import type { ProductCapability } from '../../../../types/apiTypes/CapabilityTypes';

interface Selection { productId: string | null; locked: boolean }
export function useProductSelection(detail: ConversationDetail | undefined, products: ProductCapability[] | undefined) {
  const [selections, setSelections] = useState<Record<string, Selection>>({});
  const keys = useRef<Record<string, string>>({});
  const owner = detail?.id;
  useEffect(() => {
    if (!owner) return;
    let cancelled = false;
    void tokenStorage.getToken().then((userId) => {
      const key = `zapusk-product:${userId}:${owner}`;
      keys.current[owner] = key;
      let restored: Selection = { productId: null, locked: false };
      try {
        const value: unknown = JSON.parse(localStorage.getItem(key) ?? 'null');
        if (value && typeof value === 'object' && 'productId' in value && typeof value.productId === 'string') {
          restored = { productId: value.productId, locked: 'locked' in value && value.locked === true };
        }
      } catch { /* Selection still works in memory when storage is unavailable. */ }
      if (!cancelled) setSelections((values) => owner in values ? values : { ...values, [owner]: restored });
    });
    return () => { cancelled = true; };
  }, [owner]);
  const authoritative = Boolean(detail && (detail.messages.length || detail.current_cad || (detail.dialog_state?.draft.revision ?? 0) > 0));
  const selection = owner ? selections[owner] : undefined;
  const productId = authoritative
    ? detail?.dialog_state?.draft.product_id ?? detail?.current_cad?.params.product_id ?? 'engine_assembly'
    : selection?.productId ?? null;
  const product = products?.find((item) => item.id === productId);
  const save = (value: Selection) => {
    if (!owner) return;
    setSelections((values) => ({ ...values, [owner]: value }));
    try { if (keys.current[owner]) localStorage.setItem(keys.current[owner], JSON.stringify(value)); } catch { /* Keep the in-memory choice. */ }
  };
  return {
    product, productId, authoritative,
    canEnter: Boolean(detail && (authoritative || (selection && product))),
    canChoose: Boolean(detail && !authoritative && selection && (!selection.locked || !product)),
    loading: Boolean(detail && !authoritative && !selection),
    choose: (id: string) => { if (!authoritative && selection && (!selection.locked || !product) && products?.some((p) => p.id === id)) save({ productId: id, locked: false }); },
    markSubmitted: () => { if (!authoritative && selection?.productId) save({ ...selection, locked: true }); },
    firstProductId: !authoritative && product ? product.id : undefined,
  };
}
