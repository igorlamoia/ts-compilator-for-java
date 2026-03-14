import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

// ── Fixed IDs ────────────────────────────────────────────────────────────────
const CEFET_ORG_ID   = 'c1b2e3f4-a5b6-4c7d-8e9f-a0b1c2d3e4f5'
const UFJF_ORG_ID    = 'd2c3f4a5-b6c7-4d8e-9f0a-b1c2d3e4f5a6'

const PROFESSOR_ID   = 'e3d4a5b6-c7d8-4e9f-af1b-c2d3e4f5a6b7'
const ALUNO1_ID      = '4e5b6c7-d8e9-4f0a-b02c-d3e4f5a6b7c8'
const ALUNO2_ID      = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'
const ALUNO3_ID      = 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e'

const CLASS_PROG1_ID = 'e0f4def1-c815-4edd-8dbd-fa86afc12f5f'
const CLASS_PROG2_ID = 'f1a5bef2-d926-4fee-9ece-ab97bfd23a6a'

const EX1_ID = '11111111-1111-4111-a111-111111111111'
const EX2_ID = '22222222-2222-4222-a222-222222222222'
const EX3_ID = '33333333-3333-4333-a333-333333333333'
const EX4_ID = '44444444-4444-4444-a444-444444444444'
const EX5_ID = '55555555-5555-4555-a555-555555555555'
const EX6_ID = '66666666-6666-4666-a666-666666666666'

const LIST1_ID = 'aaaa1111-bbbb-4ccc-dddd-eeee1111ffff'
const LIST2_ID = 'aaaa2222-bbbb-4ccc-dddd-eeee2222ffff'

async function main() {
  console.log('🌱 Seeding database...\n')

  // ── Organizations ────────────────────────────────────────────────────────
  for (const org of [
    { id: CEFET_ORG_ID, name: 'CEFET-MG' },
    { id: UFJF_ORG_ID,  name: 'UFJF' },
  ]) {
    await prisma.organization.upsert({
      where: { id: org.id },
      update: { name: org.name },
      create: org,
    })
  }
  console.log('✅ Organizações criadas: CEFET-MG, UFJF')

  // ── Users ────────────────────────────────────────────────────────────────
  const pwProfessor = await hash('professor', 10)
  const pwAluno     = await hash('aluno', 10)

  await prisma.user.upsert({
    where: { email: 'professor@gmail.com' },
    update: { password: pwProfessor, name: 'Prof. Carlos Silva', bio: 'Professor de Computação — Programação Java' },
    create: {
      id: PROFESSOR_ID,
      email: 'professor@gmail.com',
      password: pwProfessor,
      name: 'Prof. Carlos Silva',
      role: 'TEACHER',
      organizationId: CEFET_ORG_ID,
      bio: 'Professor de Computação — Programação Java',
    },
  })

  const students = [
    { id: ALUNO1_ID, email: 'aluno@gmail.com',  name: 'Ana Souza',       password: pwAluno },
    { id: ALUNO2_ID, email: 'aluno2@gmail.com', name: 'Bruno Oliveira',  password: pwAluno },
    { id: ALUNO3_ID, email: 'aluno3@gmail.com', name: 'Camila Ferreira', password: pwAluno },
  ]

  for (const s of students) {
    await prisma.user.upsert({
      where: { email: s.email },
      update: { password: s.password, name: s.name },
      create: {
        id: s.id,
        email: s.email,
        password: s.password,
        name: s.name,
        role: 'STUDENT',
        organizationId: CEFET_ORG_ID,
      },
    })
  }
  console.log('✅ Usuários criados: Prof. Carlos Silva, Ana Souza, Bruno Oliveira, Camila Ferreira')

  // ── Classes ──────────────────────────────────────────────────────────────
  const classesData = [
    {
      id: CLASS_PROG1_ID,
      name: 'Programação I',
      description: 'Introdução à Programação com Java — conceitos básicos, variáveis, condicionais e laços.',
      accessCode: 'PROG1-2025',
      teacherId: PROFESSOR_ID,
      organizationId: CEFET_ORG_ID,
    },
    {
      id: CLASS_PROG2_ID,
      name: 'Programação II',
      description: 'Programação Orientada a Objetos com Java — herança, polimorfismo, interfaces e coleções.',
      accessCode: 'PROG2-2025',
      teacherId: PROFESSOR_ID,
      organizationId: CEFET_ORG_ID,
    },
  ]

  for (const cls of classesData) {
    await prisma.class.upsert({
      where: { id: cls.id },
      update: { name: cls.name, description: cls.description },
      create: cls,
    })
  }
  console.log('✅ Turmas criadas: Programação I (PROG1-2025), Programação II (PROG2-2025)')

  // ── Class Members (students join both classes) ───────────────────────────
  for (const classId of [CLASS_PROG1_ID, CLASS_PROG2_ID]) {
    for (const studentId of [ALUNO1_ID, ALUNO2_ID, ALUNO3_ID]) {
      await prisma.classMember.upsert({
        where: { classId_studentId: { classId, studentId } },
        update: {},
        create: { classId, studentId },
      })
    }
  }
  console.log('✅ Alunos matriculados nas turmas PROG I e PROG II')

  // ── Exercises ────────────────────────────────────────────────────────────
  const exercises = [
    {
      id: EX1_ID,
      title: 'Hello World',
      description: 'Escreva um programa Java que imprime "Hello World" no console. Este é o seu primeiro programa!',
      attachments: '',
      teacherId: PROFESSOR_ID,
    },
    {
      id: EX2_ID,
      title: 'Soma de Dois Números',
      description: 'Leia dois números inteiros da entrada padrão e imprima a soma deles.',
      attachments: '',
      teacherId: PROFESSOR_ID,
    },
    {
      id: EX3_ID,
      title: 'Par ou Ímpar',
      description: 'Leia um número inteiro e imprima "PAR" se for par ou "IMPAR" se for ímpar.',
      attachments: '',
      teacherId: PROFESSOR_ID,
    },
    {
      id: EX4_ID,
      title: 'Fatorial',
      description: 'Calcule o fatorial de um número inteiro N (N!). Utilize um laço for ou while.',
      attachments: '',
      teacherId: PROFESSOR_ID,
    },
    {
      id: EX5_ID,
      title: 'Classe Retângulo',
      description: 'Crie uma classe Retangulo com atributos largura e altura. Implemente métodos para calcular área e perímetro.',
      attachments: '',
      teacherId: PROFESSOR_ID,
    },
    {
      id: EX6_ID,
      title: 'Herança — Animal',
      description: 'Crie uma classe base Animal com o método emitirSom(). Crie as subclasses Cachorro e Gato que sobrescrevem o método.',
      attachments: '',
      teacherId: PROFESSOR_ID,
    },
  ]

  for (const ex of exercises) {
    await prisma.exercise.upsert({
      where: { id: ex.id },
      update: { title: ex.title, description: ex.description },
      create: ex,
    })
  }
  console.log('✅ 6 exercícios criados pelo professor')

  // ── Test Cases ───────────────────────────────────────────────────────────
  const testCases = [
    // Hello World
    { exerciseId: EX1_ID, label: 'Saída padrão', input: '', expectedOutput: 'Hello World', orderIndex: 0 },
    // Soma
    { exerciseId: EX2_ID, label: 'Caso 2+3',  input: '2\n3',   expectedOutput: '5',  orderIndex: 0 },
    { exerciseId: EX2_ID, label: 'Caso 10+20', input: '10\n20', expectedOutput: '30', orderIndex: 1 },
    // Par ou Ímpar
    { exerciseId: EX3_ID, label: 'Número par',   input: '4', expectedOutput: 'PAR',   orderIndex: 0 },
    { exerciseId: EX3_ID, label: 'Número ímpar', input: '7', expectedOutput: 'IMPAR', orderIndex: 1 },
    // Fatorial
    { exerciseId: EX4_ID, label: 'Fatorial de 5', input: '5',  expectedOutput: '120', orderIndex: 0 },
    { exerciseId: EX4_ID, label: 'Fatorial de 0', input: '0',  expectedOutput: '1',   orderIndex: 1 },
    { exerciseId: EX4_ID, label: 'Fatorial de 10', input: '10', expectedOutput: '3628800', orderIndex: 2 },
  ]

  // Clean existing test cases for these exercises before inserting
  await prisma.testCase.deleteMany({
    where: { exerciseId: { in: [EX1_ID, EX2_ID, EX3_ID, EX4_ID] } },
  })
  for (const tc of testCases) {
    await prisma.testCase.create({ data: tc })
  }
  console.log('✅ 8 casos de teste criados para os exercícios')

  // ── Exercise Lists ───────────────────────────────────────────────────────
  const lists = [
    {
      id: LIST1_ID,
      title: 'Lista 1 — Fundamentos',
      description: 'Exercícios básicos de Java: Hello World, soma, condicionais e laços.',
      teacherId: PROFESSOR_ID,
    },
    {
      id: LIST2_ID,
      title: 'Lista 2 — POO',
      description: 'Exercícios de Programação Orientada a Objetos: classes, herança e polimorfismo.',
      teacherId: PROFESSOR_ID,
    },
  ]

  for (const list of lists) {
    await prisma.exerciseList.upsert({
      where: { id: list.id },
      update: { title: list.title, description: list.description },
      create: list,
    })
  }

  // List 1 items: Hello World, Soma, Par/Ímpar, Fatorial
  const list1Items = [
    { exerciseListId: LIST1_ID, exerciseId: EX1_ID, gradeWeight: 1.0, orderIndex: 0 },
    { exerciseListId: LIST1_ID, exerciseId: EX2_ID, gradeWeight: 2.0, orderIndex: 1 },
    { exerciseListId: LIST1_ID, exerciseId: EX3_ID, gradeWeight: 2.0, orderIndex: 2 },
    { exerciseListId: LIST1_ID, exerciseId: EX4_ID, gradeWeight: 5.0, orderIndex: 3 },
  ]

  // List 2 items: Classe Retângulo, Herança Animal
  const list2Items = [
    { exerciseListId: LIST2_ID, exerciseId: EX5_ID, gradeWeight: 5.0, orderIndex: 0 },
    { exerciseListId: LIST2_ID, exerciseId: EX6_ID, gradeWeight: 5.0, orderIndex: 1 },
  ]

  // Clean & re-insert list items
  await prisma.exerciseListItem.deleteMany({
    where: { exerciseListId: { in: [LIST1_ID, LIST2_ID] } },
  })
  for (const item of [...list1Items, ...list2Items]) {
    await prisma.exerciseListItem.create({ data: item })
  }
  console.log('✅ 2 listas de exercícios criadas (4 + 2 exercícios)')

  // ── Publish Lists to Classes ─────────────────────────────────────────────
  // List 1 → PROG I (nota total 10, mínimo 3 exercícios)
  await prisma.classExerciseList.upsert({
    where: { exerciseListId_classId: { exerciseListId: LIST1_ID, classId: CLASS_PROG1_ID } },
    update: {},
    create: {
      exerciseListId: LIST1_ID,
      classId: CLASS_PROG1_ID,
      deadline: new Date('2025-07-15T23:59:59Z'),
      totalGrade: 10,
      minRequired: 3,
    },
  })

  // List 2 → PROG II (nota total 10, mínimo 1 exercício)
  await prisma.classExerciseList.upsert({
    where: { exerciseListId_classId: { exerciseListId: LIST2_ID, classId: CLASS_PROG2_ID } },
    update: {},
    create: {
      exerciseListId: LIST2_ID,
      classId: CLASS_PROG2_ID,
      deadline: new Date('2025-08-30T23:59:59Z'),
      totalGrade: 10,
      minRequired: 1,
    },
  })
  console.log('✅ Listas publicadas: Lista 1 → PROG I, Lista 2 → PROG II')

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎉 Seed completo! Credenciais:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')
  console.log('👨‍🏫 Professor:')
  console.log('   Email: professor@gmail.com')
  console.log('   Senha: professor')
  console.log('')
  console.log('👩‍🎓 Aluna 1 (Ana Souza):')
  console.log('   Email: aluno@gmail.com')
  console.log('   Senha: aluno')
  console.log('')
  console.log('👨‍🎓 Aluno 2 (Bruno Oliveira):')
  console.log('   Email: aluno2@gmail.com')
  console.log('   Senha: aluno')
  console.log('')
  console.log('👩‍🎓 Aluna 3 (Camila Ferreira):')
  console.log('   Email: aluno3@gmail.com')
  console.log('   Senha: aluno')
  console.log('')
  console.log('📚 Turmas:')
  console.log('   PROG I  — Código: PROG1-2025')
  console.log('   PROG II — Código: PROG2-2025')
  console.log('')
  console.log('📝 Listas publicadas:')
  console.log('   Lista 1 (Fundamentos)  → PROG I  — 4 exercícios')
  console.log('   Lista 2 (POO)          → PROG II — 2 exercícios')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
