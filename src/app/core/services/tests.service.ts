import { Injectable, signal } from '@angular/core';
import { ApiResponse, mapApiData } from '../models/http.model';
import { User } from './users.service';

type Teacher = User;

interface Test {
  id: string;
  title: string;
  section: string;
  numQuestions: number;
  teacherId: Teacher['id'];
  creationDate: string;
}

@Injectable({ providedIn: 'root' })
export class TestsService {
  private readonly _tests = signal<Test[]>([
    {
      id: '1',
      title: 'Test A - Anatomía 3D',
      section: 'Section Ankle 1',
      numQuestions: 10,
      teacherId: '2',
      creationDate: '',
    },
    {
      id: '2',
      title: 'Test B - Radiología',
      section: 'Diagnóstico por Imagen',
      numQuestions: 15,
      teacherId: '3',
      creationDate: '',
    },
    {
      id: '3',
      title: 'Test C - Neurocirugía',
      section: 'NZeurología Avanzada',
      numQuestions: 10,
      teacherId: 'usr_123456',
      creationDate: '',
    },
  ]);

  private readonly tests = this._tests.asReadonly();

  getTests(): ApiResponse<Test> {
    return mapApiData(this.tests());
  }

  getTest(id: Test['id']): Test | null {
    const tests = this._tests().find((t) => t.id === id);
    if (!tests) return null;
    return tests;
  }

  addTest(test: Test): void {
    this._tests.update((tests) => [...tests, test]);
  }

  editTest(id: Test['id'], data: Partial<Test>): Test | null {
    this._tests.update((tests) => tests.map((t) => (t.id === id ? { ...t, ...data } : t)));

    const updatedTest = this.getTest(id);
    if (!updatedTest) return null;
    return updatedTest;
  }

  deleteTest(id: Test['id']): boolean {
    this._tests.update((tests) => tests.filter((t) => t.id !== id));
    return true;
  }
}
