import * as React from 'react';
import {
    TextInput,
    ReferenceInput,
    AutocompleteInput,
    BooleanInput,
    SelectInput,
    required,
    email,
    useCreate,
    useGetIdentity,
    useNotify,
    RadioButtonGroupInput,
} from 'react-admin';
import {
    Divider,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { useConfigurationContext } from '../root/ConfigurationContext';
import { Avatar } from './Avatar';
import { Sale } from '../types';

const isLinkedinUrl = (url: string) => {
    if (!url) return;
    try {
        // Parse the URL to ensure it is valid
        const parsedUrl = new URL(url);
        if (!parsedUrl.hostname.includes('linkedin.com')) {
            return 'URL must be from linkedin.com';
        }
    } catch (e) {
        // If URL parsing fails, return false
        return 'Must be a valid URL';
    }
};

export const ContactInputs = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Stack gap={8} p={1}>
            <Stack gap={2}>
                <Avatar />
                <Stack gap={4} flexDirection={isMobile ? 'column' : 'row'}>
                    <ContactIdentityInputs />
                    <Divider
                        orientation={isMobile ? 'horizontal' : 'vertical'}
                        flexItem
                    />
                    <ContactPositionInputs />
                </Stack>
            </Stack>

            <Stack gap={4} flexDirection={isMobile ? 'column' : 'row'}>
                <ContactPersonalInformationInputs />
                <Divider
                    orientation={isMobile ? 'horizontal' : 'vertical'}
                    flexItem
                />
                <ContactMiscInputs />
            </Stack>
        </Stack>
    );
};

const ContactIdentityInputs = () => {
    const { contactGender } = useConfigurationContext();
    return (
        <Stack gap={1} flex={1}>
            <Typography variant="h6">Identity</Typography>
            <RadioButtonGroupInput
                label={false}
                source="gender"
                choices={contactGender}
                helperText={false}
                optionText="label"
                optionValue="value"
                sx={{ '& .MuiRadio-root': { paddingY: 0 } }}
            />
            <TextInput
                source="first_name"
                validate={required()}
                helperText={false}
            />
            <TextInput
                source="last_name"
                validate={required()}
                helperText={false}
            />
        </Stack>
    );
};

const ContactPositionInputs = () => {
    const [create] = useCreate();
    const { identity } = useGetIdentity();
    const notify = useNotify();
    const handleCreateCompany = async (name?: string) => {
        if (!name) return;
        try {
            const newCompany = await create(
                'companies',
                {
                    data: {
                        name,
                        sales_id: identity?.id,
                        created_at: new Date().toISOString(),
                    },
                },
                { returnPromise: true }
            );
            return newCompany;
        } catch (error) {
            notify('An error occurred while creating the company', {
                type: 'error',
            });
        }
    };
    return (
        <Stack gap={1} flex={1}>
            <Typography variant="h6">Position</Typography>
            <TextInput source="title" helperText={false} />
            <ReferenceInput source="company_id" reference="companies">
                <AutocompleteInput
                    optionText="name"
                    validate={required()}
                    onCreate={handleCreateCompany}
                    helperText={false}
                />
            </ReferenceInput>
        </Stack>
    );
};

const ContactPersonalInformationInputs = () => {
    return (
        <Stack gap={1} flex={1}>
            <Typography variant="h6">Personal info</Typography>
            <TextInput source="email" helperText={false} validate={email()} />
            <TextInput source="phone_number1" helperText={false} />
            <TextInput source="phone_number2" helperText={false} />
            <TextInput
                source="linkedin_url"
                label="Linkedin URL"
                helperText={false}
                validate={isLinkedinUrl}
            />
        </Stack>
    );
};

const ContactMiscInputs = () => {
    return (
        <Stack gap={1} flex={1}>
            <Typography variant="h6">Misc</Typography>
            <TextInput
                source="background"
                label="Background info (bio, how you met, etc)"
                multiline
                helperText={false}
            />
            <BooleanInput source="has_newsletter" helperText={false} />
            <ReferenceInput
                reference="sales"
                source="sales_id"
                sort={{ field: 'last_name', order: 'ASC' }}
            >
                <SelectInput
                    helperText={false}
                    label="Account manager"
                    optionText={saleOptionRenderer}
                />
            </ReferenceInput>
        </Stack>
    );
};

const saleOptionRenderer = (choice: Sale) =>
    `${choice.first_name} ${choice.last_name}`;
