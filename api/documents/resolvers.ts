import { Prisma } from '@prisma/client'
import { container, injectable } from 'tsyringe'
import { Context } from '../context'
import {
  FieldValueTuple,
  DocumentRawInput,
  DocumentRawUpdateInput,
  DocumentType,
  Resolvers,
  MutationAddUserDocumentRawArgs,
  Person,
  Journal,
  QueryUserDocumentArgs,
} from '../graphql'
import { UserDocumentService, UserDocument } from './user.document.service'

// Fields that are stored as separate columns in the database
const specialFields: string[] = [
  'author',
  'editor',
  'title',
  'journal',
  'journaltitle',
  'booktitle',
  'date',
  'year',
  'month',
  'number',
  'volume',
  'edition',
  'series',
  'pages',
  'pagetotal',
  'issue',
  'note',
  'url',
  'urldate',
  'publisher',
  'abstract',
  'keywords',
  'priority',
  'doi',
  'eprint',
  'eprintclass',
  'eprinttype',
  'issn',
  'isbn',
]

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined
}

function toPair(field: string, value: string | null): FieldValueTuple | null {
  if (value) {
    return {
      field,
      value,
    }
  } else {
    return null
  }
}

function convertFromRaw(
  document: DocumentRawInput | DocumentRawUpdateInput
): Prisma.UserDocumentCreateInput {
  const special = document.fields
    ?.filter((item) => specialFields.includes(item.field))
    .map((item) => {
      return [item.field, item.value]
    })
  const other = document.fields
    ?.filter((item) => !specialFields.includes(item.field))
    .map((item) => {
      return {
        field: item.field,
        value: item.value,
      }
    })

  let convertedDocument: Prisma.UserDocumentCreateInput = {
    type: document.type ?? 'unknown',
    citationKey: document.citationKey ?? null,
    lastModified: document.lastModified ?? null,
    added: document.added ?? null,
    ...(other &&
      other.length > 0 && {
        other: {
          createMany: {
            data: other,
          },
        },
      }),
  }

  if (special) {
    convertedDocument = Object.assign(
      convertedDocument,
      Object.fromEntries(special)
    )
  }
  if ('id' in document) {
    convertedDocument = Object.assign(convertedDocument, { id: document.id })
  }

  return convertedDocument
}

export function parse(type: string): DocumentType | null {
  const found = Object.entries(DocumentType).find(
    ([key, _value]) =>
      key.localeCompare(type, undefined, { sensitivity: 'accent' }) === 0
  )
  if (found) {
    return found[1]
  } else {
    return null
  }
}

@injectable()
export class Query {
  constructor(private userDocumentService: UserDocumentService) {}

  async userDocument(
    _root: Record<string, never>,
    { id }: QueryUserDocumentArgs,
    _context: Context
  ): Promise<UserDocument | null> {
    return await this.userDocumentService.getDocumentById(id, true)
  }

  async userDocumentRaw(
    _root: Record<string, never>,
    { id }: QueryUserDocumentArgs,
    _context: Context
  ): Promise<UserDocument | null> {
    return await this.userDocumentService.getDocumentById(id, true)
  }
}

@injectable()
export class Mutation {
  constructor(private userDocumentService: UserDocumentService) {}

  async addUserDocumentRaw(
    _root: Record<string, never>,
    { document }: MutationAddUserDocumentRawArgs,
    _context: Context
  ): Promise<UserDocument | null> {
    return await this.userDocumentService.addDocument(convertFromRaw(document))
  }
}

@injectable()
export class DocumentResolver {
  __resolveType(document: UserDocument): 'Article' | 'Unknown' {
    switch (parse(document.type)) {
      case DocumentType.Article:
        return 'Article'
      default:
        return 'Unknown'
    }
  }
}

@injectable()
export class DocumentRawResolver {
  fields(document: UserDocument): FieldValueTuple[] {
    const documentFields = Object.entries(document)
      .filter(([key, _]) => specialFields.includes(key))
      .map(([key, value]) => toPair(key, value as string))
      .filter(notEmpty)

    let otherFields: FieldValueTuple[] = []
    if (document.other) {
      // document.other is an array of objects of the form { field: value }
      otherFields = (document.other as Prisma.JsonArray)
        .map((item) => {
          if (item) {
            const [key, value] = Object.entries(item)[0]
            return toPair(key as string, value as string)
          }
          return null
        })
        .filter(notEmpty)
    }
    return [...documentFields, ...otherFields]
  }
}

@injectable()
export class ArticleResolver {
  author(document: UserDocument): Person | null {
    if (document.author) {
      return {
        id: 'TODO',
        name: document.author,
        __typename: 'Person',
      }
    } else {
      return null
    }
  }

  journal(document: UserDocument): Journal | null {
    const journalName = document.journal ?? document.journaltitle
    if (journalName) {
      return {
        id: 'TODO',
        name: journalName,
      }
    } else {
      return null
    }
  }
}

export function resolvers(): Resolvers {
  return {
    Query: container.resolve(Query),
    Mutation: container.resolve(Mutation),
    Document: container.resolve(DocumentResolver),
    DocumentRaw: container.resolve(DocumentRawResolver),
    Article: container.resolve(ArticleResolver),
  }
}
