export const AuditableSchema = {
    createdAt: {
        type: Date,
        name: 'created_at',
        default: () => 'CURRENT_TIMESTAMP',
    },
    updatedAt: {
        type: Date,
        name: 'updated_at',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    },
    deletedAt: {
        type: Date,
        name: 'deleted_at',
        nullable: true,
    }
}