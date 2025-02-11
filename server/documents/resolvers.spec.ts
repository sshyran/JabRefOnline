import { UserDocument } from '@prisma/client'
import mocking from 'jest-mock-extended'
import { createUnauthenticatedContext } from '~/test/context.helper'
import { register, resolve } from '../tsyringe'
import { DocumentResolver } from './resolvers'
import { UserDocumentService } from './user.document.service'

const userDocumentService = mocking.mock<UserDocumentService>()
register('UserDocumentService', { useValue: userDocumentService })
const query = resolve('DocumentQuery')
const mutation = resolve('DocumentMutation')

const context = createUnauthenticatedContext()

beforeEach(() => {
  mocking.mockReset(userDocumentService)
})

describe('Query', () => {
  describe('userDocument', () => {
    it('gets the correct document', async () => {
      userDocumentService.getDocumentById
        .calledWith('uniqueId')
        .mockResolvedValueOnce({
          id: 'uniqueId',
          type: 'OTHER',
        } as UserDocument)
      const document = await query.userDocument({}, { id: 'uniqueId' }, context)
      expect(document).toEqual({
        id: 'uniqueId',
        type: 'OTHER',
      })
    })
  })
})

describe('Mutation', () => {
  describe('addUserDocument', () => {
    /* TODO: Handle other fields
    it('converts other unknown fields correctly', async () => {
      await mutation.addUserDocument(
        {},
        {
          input: {
            journalArticle: {
              other: [
                {
                  field: 'some',
                  value: 'random field',
                },
              ],
            }
          },
        },
        context
      )
      expect(userDocumentService.addDocument).toHaveBeenCalledWith({
        added: null,
        citationKey: null,
        lastModified: null,
        type: 'something',
        other: {
          createMany: {
            data: [
              {
                field: 'some',
                value: 'random field',
              },
            ],
          },
        },
      })
    })
    */

    it('converts single person author correctly', async () => {
      await mutation.addUserDocument(
        {},
        {
          input: {
            journalArticle: {
              authors: [
                {
                  person: {
                    name: 'JabRef devs',
                  },
                },
              ],
            },
          },
        },
        context
      )
      expect(userDocumentService.addDocument).toHaveBeenCalledWith({
        added: null,
        citationKeys: [],
        lastModified: null,
        type: 'JOURNAL_ARTICLE',
        author: 'JabRef devs',
        abstract: undefined,
        doi: undefined,
        electronicId: null,
        keywords: [],
        languages: [],
        note: undefined,
        originalLanguages: [],
        pageEnd: null,
        pageStart: null,
        publicationState: undefined,
        publishedAt: null,
        subtitle: undefined,
        title: undefined,
        titleAddon: undefined,
        translators: [],
      })
    })
  })
})

describe('DocumentResolver', () => {
  const documentResolver = new DocumentResolver()
  describe('resolveType', () => {
    it('returns JournalArticle for articles', () => {
      const article = {
        type: 'JOURNAL_ARTICLE',
      } as UserDocument
      expect(documentResolver.__resolveType(article)).toEqual('JournalArticle')
    })
  })
})
