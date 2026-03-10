"use client";

import { useEffect, useState } from "react";

type Question = { id: number; category: string; question: string; type: string; required: boolean };
type Answer = { id: number; questionId: number; answer: string };

export default function QuestionnairePage({ params }: { params: { id: string } }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const load = async () => {
    const [qRes, aRes] = await Promise.all([
      fetch("/api/questions"),
      fetch(`/api/answers?projectId=${params.id}`)
    ]);
    const q = await qRes.json();
    const ans = await aRes.json();
    const map: Record<number, string> = {};
    ans.forEach((row: Answer) => {
      map[row.questionId] = row.answer;
    });
    setQuestions(q);
    setAnswers(map);
  };

  useEffect(() => {
    load();
  }, [params.id]);

  const saveAnswer = async (questionId: number) => {
    await fetch("/api/answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: Number(params.id),
        questionId,
        answer: answers[questionId] ?? ""
      })
    });
    await load();
  };

  const renderInput = (q: Question) => {
    if (q.type === "boolean") {
      return (
        <select
          className="input w-full"
          value={answers[q.id] || ""}
          onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
        >
          <option value="">Sélection</option>
          <option value="Oui">Oui</option>
          <option value="Non">Non</option>
        </select>
      );
    }

    if (q.type === "select") {
      return (
        <input
          className="input"
          placeholder="Réponse (sélection)"
          value={answers[q.id] || ""}
          onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
        />
      );
    }

    return (
      <textarea
        className="input"
        value={answers[q.id] || ""}
        onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
      />
    );
  };

  const grouped = questions.reduce<Record<string, Question[]>>((acc, question) => {
    acc[question.category] = acc[question.category] || [];
    acc[question.category].push(question);
    return acc;
  }, {});

  return (
    <div className="grid gap-4">
      {Object.entries(grouped).map(([category, qList]) => (
      <section key={category} className="card">
          <h3 className="mb-2 text-lg font-semibold uppercase text-sky-300">
            {category === "business" ? "Métier" : category === "functional" ? "Fonctionnel" : category === "technical" ? "Technique" : category === "security" ? "Sécurité" : category === "data" ? "Données" : category}
          </h3>
          <div className="grid gap-3">
            {qList.map((question) => (
              <div key={question.id} className="grid gap-2">
                <label className="text-sm">
                  {question.question} {question.required ? "*" : ""}
                </label>
                {renderInput(question)}
                <button className="btn self-start" type="button" onClick={() => saveAnswer(question.id)}>
                  Sauvegarder
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
