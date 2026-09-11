'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';

const CLOTHING = [
  { size: 'XS', bust: '80 - 84', waist: '60 - 64', hip: '86 - 90' },
  { size: 'S', bust: '85 - 89', waist: '65 - 69', hip: '91 - 95' },
  { size: 'M', bust: '90 - 94', waist: '70 - 74', hip: '96 - 100' },
  { size: 'L', bust: '95 - 99', waist: '75 - 80', hip: '101 - 105' },
  { size: 'XL', bust: '100 - 105', waist: '81 - 86', hip: '106 - 111' },
];

const SHOES = [
  { size: '35', cm: '22.5' },
  { size: '36', cm: '23.0' },
  { size: '37', cm: '23.5' },
  { size: '38', cm: '24.5' },
  { size: '39', cm: '25.0' },
  { size: '40', cm: '25.5' },
];

export function SizeGuide({ kind = 'ROPA' }: { kind?: 'ROPA' | 'CALZADO' }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="link-underline text-[10px] font-semibold tracking-brand text-ink-700"
      >
        GUÍA DE TALLAS
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="GUÍA DE TALLAS" size="md">
        <p className="mb-5 text-[10px] leading-relaxed tracking-wider2 text-smoke-600">
          MEDIDAS EN CENTÍMETROS. SI ESTÁS ENTRE DOS TALLAS, TE RECOMENDAMOS ELEGIR LA MAYOR PARA UN
          AJUSTE MÁS CÓMODO.
        </p>

        {kind === 'CALZADO' ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>TALLA</th>
                <th>LARGO DEL PIE (CM)</th>
              </tr>
            </thead>
            <tbody>
              {SHOES.map((row) => (
                <tr key={row.size}>
                  <td className="font-semibold">{row.size}</td>
                  <td>{row.cm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>TALLA</th>
                <th>BUSTO</th>
                <th>CINTURA</th>
                <th>CADERA</th>
              </tr>
            </thead>
            <tbody>
              {CLOTHING.map((row) => (
                <tr key={row.size}>
                  <td className="font-semibold">{row.size}</td>
                  <td>{row.bust}</td>
                  <td>{row.waist}</td>
                  <td>{row.hip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p className="mt-5 text-[10px] leading-relaxed tracking-wider2 text-smoke-600">
          ¿DUDAS CON TU TALLA? ESCRÍBENOS POR WHATSAPP Y TE AYUDAMOS A ELEGIR.
        </p>
      </Modal>
    </>
  );
}
