"use client";

import styles from "./InstructionForm.module.css";

interface InstructionFormProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  disabled: boolean;
}

export default function InstructionForm({
  value,
  onChange,
  onGenerate,
  isLoading,
  disabled,
}: InstructionFormProps) {
  return (
    <div className={styles.form}>
      <label htmlFor="instructions" className={styles.label}>
        修正指示
      </label>
      <textarea
        id="instructions"
        className={styles.textarea}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`修正内容を入力してください（改行で区切ります）

例:
1.今回のブレンドは有機ではないため、コーヒー豆となります。
2.枠外の上に商品名が必要となります。
3.名称はレギュラーコーヒーの記載となります。`}
        rows={8}
      />
      <button
        className={styles.button}
        onClick={onGenerate}
        disabled={disabled || isLoading}
      >
        {isLoading ? (
          <>
            <span className={styles.spinner}></span>
            生成中...
          </>
        ) : (
          "指示書を生成"
        )}
      </button>
    </div>
  );
}
